import {
  InstancedMesh,
  BufferGeometry,
  Mesh,
  Group,
  Color,
  GridHelper,
  DynamicDrawUsage,
  MeshBasicMaterial,
  Scene,
  WebGLRenderer,
  sRGBEncoding,
  PerspectiveCamera,
  Matrix4,
  IcosahedronGeometry,
  Vector3,
} from "../vendor/three.js";

import { mergeBufferGeometries } from "../vendor/BufferGeometryUtils.js";
import { GLTF, GLTFLoader } from "../vendor/GLTFLoader.js";
import { OrbitControls } from "../vendor/OrbitControls.js";

import { Model } from "../Model.js";
import {
  RenderableEntity,
  isRenderable,
  isRenderableGrid,
  isRenderableModel,
  isRenderableSphere,
} from "../components/Components.js";
import { remap } from "../utils.js";
import {
  GLTFRenderComponent,
  GridRenderComponent,
  SphereRenderComponent,
} from "../components/RenderComponent.js";
import { Quaternion } from "../vendor/three.js";
import { dirs } from "../components/WanderComponent.js";
import { Euler } from "../vendor/three.js";
import { MeshPhongMaterial } from "../vendor/three.js";
import { HemisphereLight } from "../vendor/three.js";
import { MeshLambertMaterial } from "../vendor/three.js";

type EntityIdToThreeId = {
  [entityID: string]: number | undefined;
};

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
    color: THREE.Color;
  };
}

const GLTFs = await loadModels();

const instanceMeshes: { [name: string]: InstanceBookkeeping } = {
  sphere: {
    inst: getInstancedSphere(),
    idCounter: 0,
    registers: {
      matrix: new Matrix4(),
      color: new Color(1, 0, 0.5),
    },
  },
  rat: {
    inst: getInstancedModel(),
    idCounter: 0,
    registers: {
      matrix: new Matrix4(),
      color: new Color(1, 0, 0.5),
    },
  },
};

scene.add(instanceMeshes.sphere.inst);
scene.add(instanceMeshes.rat.inst);
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
  const geo = groupToBuffer(GLTFs["rat"].scene);
  geo.computeVertexNormals();
  geo.scale(2, 2, 2);
  const instancedMesh = new InstancedMesh(
    geo,
    new MeshLambertMaterial({ color: 0xff00ff }),
    10000
  );
  instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
  instancedMesh.count = 0;
  return instancedMesh;
}

async function loadModels() {
  const gltfPaths = [
    {
      path: "/assets/models/rat_2.2.gltf",
      refName: "rat",
    },
  ];
  const gltfLoader = new GLTFLoader();
  return (
    await Promise.all(
      gltfPaths.map(
        async ({
          path,
          refName,
        }): Promise<{ model: GLTF; refName: string }> => ({
          model: await gltfLoader.loadAsync(path),
          refName,
        })
      )
    )
  ).reduce(
    (memo: { [refName: string]: GLTF }, x) => ({
      ...memo,
      [x.refName]: x.model,
    }),
    {}
  );
}

function updateSphere(
  sphereEntity: RenderableEntity<SphereRenderComponent>
): void {
  const id = entityIdToInstanceId[sphereEntity.id];
  const {
    inst,
    idCounter,
    registers: { matrix, color },
  } = instanceMeshes.sphere;

  matrix.identity();
  color.setRGB(1, 1, 1);

  if (id === undefined) {
    matrix.setPosition(0, 0, 0);
    entityIdToInstanceId[sphereEntity.id] = idCounter;
    inst.setMatrixAt(idCounter, matrix);
    inst.setColorAt(idCounter, new Color(0xffffff));

    instanceMeshes.sphere.idCounter = idCounter + 1;
  } else {
    const { x, y, z } = sphereEntity.components.position;
    matrix.setPosition(x, y, z);
    inst.setMatrixAt(id, matrix);

    const w = sphereEntity.components.wander;
    if (w) {
      color.r = remap(0, 1, 0, 1, true)(w.speed);
      color.g = w.internalRoll;
      color.b = 0.8;
    }
    inst.setColorAt(id, color);
  }
}

const v = new Vector3();
const rotations = [0, Math.PI, Math.PI / 2, (3 * Math.PI) / 2].map(
  (r) => new Euler(0, r, 0)
);

function update3DModel(value: RenderableEntity<GLTFRenderComponent>): void {
  const id = entityIdToInstanceId[value.id];
  const {
    inst,
    idCounter,
    registers: { matrix, color },
  } = instanceMeshes.rat;
  color.setRGB(1, 1, 1);

  if (id === undefined) {
    entityIdToInstanceId[value.id] = idCounter;
    inst.count = idCounter;
    instanceMeshes.rat.idCounter = idCounter + 1;
  } else {
    const w = value.components.wander;
    if (w) {
      color.r = 0;
      color.g = 0;
      color.b = 0;
      inst.setColorAt(id, color);

      matrix.makeRotationFromEuler(rotations[w.directionIndex]);
    }
    const { x, y, z } = value.components.position;
    //v.setFromMatrixPosition(matrix);
    matrix.setPosition(x, y, z);

    inst.setMatrixAt(id, matrix);
  }
}

function updateGrid(gridEntity: RenderableEntity<GridRenderComponent>) {
  const id = entityIdToSceneChild[gridEntity.id];
  if (id === undefined) {
    const grid = new GridHelper(100, 10, 0xff0000);
    scene.add(grid);
    entityIdToSceneChild[gridEntity.id] = grid.id;
  } else {
    const childIdx = scene.children.findIndex(
      (c: any) => c.id === entityIdToSceneChild[gridEntity.id]
    );
    scene.children[childIdx].position.set(
      gridEntity.components.position.x,
      gridEntity.components.position.y,
      gridEntity.components.position.z
    );
  }
}

export function updateTHREEScene(model: Model): Model {
  const renderables = model.entities.filter(isRenderable);

  renderables.filter(isRenderableSphere).forEach(updateSphere);
  setInstUpdate(instanceMeshes.sphere.inst);

  renderables.filter(isRenderableGrid).forEach(updateGrid);

  renderables.filter(isRenderableModel).forEach(update3DModel);
  setInstUpdate(instanceMeshes.rat.inst);

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
