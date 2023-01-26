import {
  GridHelper,
  InstancedMesh,
  Matrix4,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Euler,
  HemisphereLight,
  sRGBEncoding,
  Object3D,
} from "../vendor/three.js";

import { OrbitControls } from "../vendor/OrbitControls.js";

import { Model } from "../Model.js";
import {
  RenderableEntity,
  hasRotation,
  isRenderable,
  isRenderableGrid,
  isRenderableInstanceModel,
  isRenderableModel,
  isRenderableSphere,
} from "../components/Components.js";
import {
  GLTFRenderComponent,
  GridRenderComponent,
  SupportSceneParent,
  SphereRenderComponent,
  SupportInstance,
  InstancedGLTFRenderComponent,
} from "../components/RenderComponent.js";
import { RotationComponent, rots } from "../components/RotationComponent.js";
import { getInstanceMeshes, getInstanceSubmodel } from "./loadModels.js";

type EntityIdToThreeId = {
  [entityID: string]: number | undefined;
};

const eulers = rots.map((r) => new Euler(r[0], r[1], r[2]));
let entityIdToSceneChild: EntityIdToThreeId = {};
let entityIdToInstanceId: EntityIdToThreeId = {};

let scene = new Scene();

const canvas = document.querySelector("canvas");
if (!canvas) throw new Error("canvas not found on page");

const renderer = new WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = sRGBEncoding;

const camera = new PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);

const orbitControls = new OrbitControls(camera, canvas);

interface InstanceBookkeeping {
  inst: InstancedMesh;
  idCounter: number;
  registers: {
    matrix: THREE.Matrix4;
    euler: THREE.Euler;
  };
}

const instanceMeshes: { [name: string]: InstanceBookkeeping } =
  getInstanceMeshes();
scene.add(new HemisphereLight(0xffffff, 0xff0033, 1));

Object.keys(instanceMeshes).forEach((k) => {
  scene.add(instanceMeshes[k].inst);
});

function updateSphere(
  sphereEntity: RenderableEntity<SphereRenderComponent>
): void {
  return instancedUpdate(sphereEntity, "sphere");
}

function updateBasicRotation(rotation: RotationComponent, childIdx: number) {
  const { style } = rotation;
  if (style === "standard") {
    const { dix } = rotation;
    scene.children[childIdx].setRotationFromEuler(eulers[dix]);
  } else {
    const { axis, amt } = rotation;
    const euler = new Euler(
      axis === 0 ? amt : 0,
      axis === 1 ? amt : 0,
      axis === 2 ? amt : 0
    );
    scene.children[childIdx].setRotationFromEuler(euler);
  }
}

function updateInstanceRotation(
  rotation: RotationComponent,
  matrix: Matrix4,
  euler: Euler
) {
  const { style } = rotation;
  if (style === "angle axis") {
    const { axis, amt } = rotation;
    euler.set(axis === 0 ? amt : 0, axis === 1 ? amt : 0, axis === 2 ? amt : 0);
    matrix.makeRotationFromEuler(euler);
  } else {
    matrix.makeRotationFromEuler(eulers[rotation.dix]);
  }
}

function instancedUpdate(
  entity: RenderableEntity<SupportInstance>,
  instanceKey: string
): void {
  const id = entityIdToInstanceId[entity.id];
  const {
    inst,
    idCounter,
    registers: { matrix, euler },
  } = instanceMeshes[instanceKey];

  matrix.identity();

  if (id === undefined) {
    matrix.setPosition(0, 0, 0);
    if (hasRotation(entity)) {
      updateInstanceRotation(entity.components.rotation, matrix, euler);
    }
    inst.setMatrixAt(idCounter, matrix);

    const newCount = idCounter + 1;
    entityIdToInstanceId[entity.id] = idCounter;
    instanceMeshes[instanceKey].idCounter = newCount;
    instanceMeshes[instanceKey].inst.count = newCount;
  } else {
    if (hasRotation(entity)) {
      updateInstanceRotation(entity.components.rotation, matrix, euler);
    }
    const { x, y, z } = entity.components.position;
    matrix.setPosition(x, y, z);
    inst.setMatrixAt(id, matrix);
  }
}

function update3DModel(
  value: RenderableEntity<InstancedGLTFRenderComponent>
): void {
  return instancedUpdate(value, value.components.render.refName);
}

function updateSubmodel(value: RenderableEntity<GLTFRenderComponent>): void {
  const { refName, objectName } = value.components.render;
  return basicUpdate(value, () => {
    return getInstanceSubmodel(refName, objectName);
  });
}

function basicUpdate(
  entity: RenderableEntity<SupportSceneParent>,
  createObjFn: () => Object3D
) {
  const id = entityIdToSceneChild[entity.id];
  if (id === undefined) {
    const o = createObjFn();
    scene.add(o);
    entityIdToSceneChild[entity.id] = o.id;
  } else {
    const childIdx = scene.children.findIndex(
      (c: any) => c.id === entityIdToSceneChild[entity.id]
    );

    if (hasRotation(entity)) {
      updateBasicRotation(entity.components.rotation, childIdx);
    }
    scene.children[childIdx].position.set(
      entity.components.position.x,
      entity.components.position.y,
      entity.components.position.z
    );
  }
}

function updateGrid(gridEntity: RenderableEntity<GridRenderComponent>) {
  basicUpdate(gridEntity, () => new GridHelper(100, 10, 0xff0000));
}

export function updateTHREEScene(model: Model): Model {
  const renderables = model.entities.filter(isRenderable);

  renderables.filter(isRenderableSphere).forEach(updateSphere);
  renderables.filter(isRenderableGrid).forEach(updateGrid);
  renderables.filter(isRenderableInstanceModel).forEach(update3DModel);
  renderables.filter(isRenderableModel).forEach(updateSubmodel);

  Object.keys(instanceMeshes).forEach((k) => {
    setInstUpdate(instanceMeshes[k].inst);
  });

  orbitControls.update();
  renderer.render(scene, camera);

  return {
    ...model,
  };
}
function setInstUpdate(inst: InstancedMesh) {
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) {
    inst.instanceColor.needsUpdate = true;
  }
}
