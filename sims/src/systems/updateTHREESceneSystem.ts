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
  Vector3,
  WebGLRenderer,
  Euler,
  HemisphereLight,
  MeshLambertMaterial,
  sRGBEncoding,
  DoubleSide,
} from "../vendor/three.js";

import { mergeBufferGeometries } from "../vendor/BufferGeometryUtils.js";
import { GLTF, GLTFLoader } from "../vendor/GLTFLoader.js";
import { OrbitControls } from "../vendor/OrbitControls.js";

import { Model } from "../Model.js";
import {
  RenderableEntity,
  hasRotation,
  isRenderable,
  isRenderableGrid,
  isRenderableModel,
  isRenderableSphere,
} from "../components/Components.js";
import {
  GLTFRenderComponent,
  GridRenderComponent,
  SupportSceneParent,
  SphereRenderComponent,
  SupportInstance,
} from "../components/RenderComponent.js";
import { remap } from "../utils.js";
import { PlaneGeometry } from "../vendor/three.js";
import { Object3D } from "../vendor/three.js";
import { rots } from "../components/RotationComponent.js";

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
  plane: {
    inst: getInstancedPlane(),
    idCounter: 0,
    registers: {
      matrix: new Matrix4(),
      color: new Color(1, 0, 0.5),
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

function getInstancedPlane() {
  const instancedMesh = new InstancedMesh(
    new PlaneGeometry(100, 100, 2, 2),
    new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide }),
    10000
  );
  instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
  instancedMesh.count = 0;
  return instancedMesh;
}

function updateSphere(
  sphereEntity: RenderableEntity<SphereRenderComponent>
): void {
  return instancedUpdate(sphereEntity, "sphere");
}

function instancedUpdate(
  entity: RenderableEntity<SupportInstance>,
  instanceKey: string
): void {
  const id = entityIdToInstanceId[entity.id];
  const {
    inst,
    idCounter,
    registers: { matrix, color },
  } = instanceMeshes[instanceKey];

  matrix.identity();

  if (id === undefined) {
    matrix.setPosition(0, 0, 0);
    entityIdToInstanceId[entity.id] = idCounter;
    inst.setMatrixAt(idCounter, matrix);

    const newCount = idCounter + 1;
    instanceMeshes[instanceKey].idCounter = newCount;
    instanceMeshes[instanceKey].inst.count = newCount;
  } else {
    if (hasRotation(entity)) {
      matrix.makeRotationFromEuler(eulers[entity.components.rotation.dix]);
    }
    const { x, y, z } = entity.components.position;
    matrix.setPosition(x, y, z);
    inst.setMatrixAt(id, matrix);
  }
}

function update3DModel(value: RenderableEntity<GLTFRenderComponent>): void {
  return instancedUpdate(value, value.components.render.refName);
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
  renderables.filter(isRenderableModel).forEach(update3DModel);

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
