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
  Vector3,
} from "../../vendor/three.js";

import { OrbitControls } from "../../vendor/OrbitControls.js";

import { Model } from "../../Model.js";
import {
  Components,
  RenderableEntity,
  hasRotation,
  isEntityWith,
  isRenderable,
  isRenderableGrid,
  isRenderableInstanceModel,
  isRenderableModel,
  isRenderableSphere,
} from "../../components/Components.js";
import {
  GLTFRenderComponent,
  GridRenderComponent,
  SupportSceneParent,
  SphereRenderComponent,
  SupportInstance,
  InstancedGLTFRenderComponent,
} from "../../components/RenderComponent.js";
import { RotationComponent, rots } from "../../components/RotationComponent.js";
import { getInstanceMeshes, getSubmodel } from "../loadModels.js";
import { init, inputSystem } from "./inputSystem.js";
import {
  entityIdToInstanceId,
  entityIdToSceneChild,
  instanceIdToEntityId,
  registers,
} from "./threeOptimizations.js";
import { Entity } from "../../Entity.js";

const eulers = rots.map((r) => new Euler(r[0], r[1], r[2]));
let scene = new Scene();

const canvas = document.querySelector("canvas");
if (!canvas) throw new Error("canvas not found on page");

const renderer = new WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = sRGBEncoding;

const camera = new PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 100, 1);
camera.lookAt(0, 0, 0);

const orbitControls = new OrbitControls(camera, canvas);

interface InstanceBookkeeping {
  inst: InstancedMesh;
  idCounter: number;
}

const instanceMeshes: { [name: string]: InstanceBookkeeping } =
  await getInstanceMeshes();
scene.add(new HemisphereLight(0xffffff, 0xff0033, 1));

Object.keys(instanceMeshes).forEach((k) => {
  scene.add(instanceMeshes[k].inst);
});

init(camera, instanceMeshes.plane.inst);

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

function updateInstanceRotation(rotation: RotationComponent) {
  const { style } = rotation;
  if (style === "angle axis") {
    const { axis, amt } = rotation;
    registers.euler.set(
      axis === 0 ? amt : 0,
      axis === 1 ? amt : 0,
      axis === 2 ? amt : 0
    );
    registers.matrix.makeRotationFromEuler(registers.euler);
  } else {
    registers.matrix.makeRotationFromEuler(eulers[rotation.dix]);
  }
}

function updateInstanceTransform(components: Components): void {
  const { matrix, vector } = registers;
  matrix.identity();
  matrix.setPosition(0, 0, 0);
  if (components.rotation) {
    updateInstanceRotation(components.rotation);
  }
  if (components.scale) {
    const { amt } = components.scale;
    if (typeof amt === "number") {
      vector.set(amt, amt, amt);
    } else {
      vector.set(amt[0], amt[1], amt[2]);
    }
    matrix.scale(vector);
  }
  if (components.position) {
    const { x, y, z } = components.position;
    matrix.setPosition(x, y, z);
  }
}

function updateInstanceColor(components: Components) {
  if (components.color) {
    registers.color.setRGB(
      components.color.r,
      components.color.g,
      components.color.b
    );
  } else {
    registers.color.setRGB(0, 0, 0);
  }
}

function instancedUpdate(
  entity: RenderableEntity<SupportInstance>,
  instanceKey: string
): void {
  const id = entityIdToInstanceId[entity.id];
  const { inst, idCounter } = instanceMeshes[instanceKey];

  if (id === undefined) {
    updateInstanceColor(entity.components);
    inst.setColorAt(idCounter, registers.color);
    updateInstanceTransform(entity.components);
    inst.setMatrixAt(idCounter, registers.matrix);

    const newCount = idCounter + 1;
    entityIdToInstanceId[entity.id] = idCounter;
    instanceIdToEntityId[inst.name][`${idCounter}`] = entity.id;
    instanceMeshes[instanceKey].idCounter = newCount;
    instanceMeshes[instanceKey].inst.count = newCount;
  } else {
    updateInstanceColor(entity.components);
    inst.setColorAt(id, registers.color);
    updateInstanceTransform(entity.components);
    inst.setMatrixAt(id, registers.matrix);
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
    return getSubmodel(refName, objectName);
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
    // there's an off-by-one-frame error here and instancedUpdate, if we separate the
    // else condition into a fn and call that fn in the creation case as well,
    // it should fix it
    const childIdx = scene.children.findIndex(
      (c: any) => c.id === entityIdToSceneChild[entity.id]
    );
    if (isEntityWith(entity, "scale")) {
      const { amt } = entity.components.scale;
      if (typeof amt === "number") {
        scene.children[childIdx].scale.set(amt, amt, amt);
      } else {
        scene.children[childIdx].scale.set(amt[0], amt[1], amt[2]);
      }
    }

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

  return inputSystem(model);
}
function setInstUpdate(inst: InstancedMesh) {
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) {
    inst.instanceColor.needsUpdate = true;
  }
}
