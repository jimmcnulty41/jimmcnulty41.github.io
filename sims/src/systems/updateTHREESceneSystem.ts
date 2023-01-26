import {
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  GridHelper,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Euler,
  HemisphereLight,
  MeshLambertMaterial,
  sRGBEncoding,
  DoubleSide,
} from "../vendor/three.js";

import { mergeBufferGeometries } from "../vendor/BufferGeometryUtils.js";
import { GLTF, GLTFLoader, GLTFParser } from "../vendor/GLTFLoader.js";
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
import { remap } from "../utils.js";
import { PlaneGeometry } from "../vendor/three.js";
import { Object3D } from "../vendor/three.js";
import { RotationComponent, rots } from "../components/RotationComponent.js";

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

const GLTFs = await loadModels();

const instanceMeshes: { [name: string]: InstanceBookkeeping } = {
  sphere: {
    inst: getInstancedSphere(),
    idCounter: 0,
    registers: {
      matrix: new Matrix4(),
      euler: new Euler(),
    },
  },
  rat: {
    inst: getInstancedModel(),
    idCounter: 0,
    registers: {
      matrix: new Matrix4(),
      euler: new Euler(),
    },
  },
  plane: {
    inst: getInstancedPlane(),
    idCounter: 0,
    registers: {
      matrix: new Matrix4(),
      euler: new Euler(),
    },
  },
};
Object.keys(instanceMeshes).forEach((k) => {
  scene.add(instanceMeshes[k].inst);
});

scene.add(new HemisphereLight(0xffffff, 0xff0033, 1));

function getInstancedSphere() {
  const instancedMesh = new InstancedMesh(
    new IcosahedronGeometry(10, 3),
    new MeshBasicMaterial({ color: 0xffffff }),
    10000
  );
  instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
  instancedMesh.count = 0;
  return instancedMesh;
}

function groupToBuffer(group: Group): BufferGeometry {
  const meshes: Mesh[] = [];
  group.traverse((c) => {
    if ((c as Mesh).isMesh) {
      meshes.push(c as Mesh);
    }
  });
  const geos = meshes.map((m) => m.geometry);
  const bufferGeometry = mergeBufferGeometries(geos);

  return bufferGeometry;
}

function getInstancedModel() {
  const refName = "rat";
  const model = GLTFs[refName];
  const geo = groupToBuffer(model.model.scene);
  geo.computeVertexNormals();
  geo.scale(model.scale[0], model.scale[1], model.scale[2]);
  const instancedMesh = new InstancedMesh(
    geo,
    new MeshLambertMaterial({ color: 0xff00ff }),
    10000
  );
  instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
  instancedMesh.count = 0;
  return instancedMesh;
}

type ModelData = { [refName: string]: { model: GLTF; scale: number[] } };

async function loadModels(): Promise<ModelData> {
  const gltfPaths = [
    {
      path: "/assets/models/rat_2.2.gltf",
      refName: "rat",
      scale: [2, 2, 2],
    },
    {
      path: "/assets/models/self_portrait_2.gltf",
      refName: "head_top",
      scale: [20, 20, 20],
    },
  ];
  const gltfLoader = new GLTFLoader();
  return (
    await Promise.all(
      gltfPaths.map(async ({ path, refName, scale }) => ({
        model: await gltfLoader.loadAsync(path),
        refName,
        scale,
      }))
    )
  ).reduce(
    (memo, x) => ({
      ...memo,
      [x.refName]: {
        model: x.model,
        scale: x.scale,
      },
    }),
    {}
  );
}

function getInstancedPlane() {
  const geo = new PlaneGeometry(12, 7, 2, 2);
  geo.rotateX(Math.PI / 2);
  geo.rotateY(Math.PI / 2);
  const instancedMesh = new InstancedMesh(
    geo,
    new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide }),
    10000
  );
  instancedMesh.count = 0;
  return instancedMesh;
}

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

function isBufferGeometry(blah: any): blah is BufferGeometry {
  return (blah as BufferGeometry).isBufferGeometry;
}

function updateSubmodel(value: RenderableEntity<GLTFRenderComponent>): void {
  const objectName = value.components.render.objectName;
  return basicUpdate(value, () => {
    const gltf = GLTFs[value.components.render.refName];
    const group = gltf.model.scene;
    let geo = null;
    if (objectName !== undefined) {
      geo = gltf.model.scene.getObjectByName(objectName);
      if ((geo as Mesh).isMesh) {
        (geo as Mesh).geometry.computeVertexNormals();
        (geo as Mesh).geometry.scale(
          gltf.scale[0],
          gltf.scale[1],
          gltf.scale[2]
        );
        return geo as Mesh;
      }
    } else {
      geo = groupToBuffer(group);
    }
    if (!isBufferGeometry(geo)) {
      throw new Error(`issues getting submodel ${objectName}`);
    }
    return new Mesh(geo, new MeshLambertMaterial({ color: 0xaa33cc }));
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
