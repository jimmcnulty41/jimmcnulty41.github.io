import { mergeBufferGeometries } from "../vendor/BufferGeometryUtils.js";
import { GLTF, GLTFLoader } from "../vendor/GLTFLoader.js";
import {
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PlaneGeometry,
} from "../vendor/three.js";

export type ModelData = { [refName: string]: { model: GLTF; scale: number[] } };

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

const GLTFs = await loadModels();

export function getInstanceMeshes() {
  return {
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
function getInstancedPlane() {
  const geo = new PlaneGeometry(1.2, 0.7, 2, 2);
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

function isBufferGeometry(blah: any): blah is BufferGeometry {
  return (blah as BufferGeometry).isBufferGeometry;
}

export function getInstanceSubmodel(refName: string, objectName?: string) {
  const gltf = GLTFs[refName];
  const group = gltf.model.scene;
  let geo = null;
  if (objectName !== undefined) {
    geo = gltf.model.scene.getObjectByName(objectName);
    if ((geo as Mesh).isMesh) {
      (geo as Mesh).geometry.computeVertexNormals();
      (geo as Mesh).geometry.scale(gltf.scale[0], gltf.scale[1], gltf.scale[2]);
      return geo as Mesh;
    }
  } else {
    geo = groupToBuffer(group);
  }
  if (!isBufferGeometry(geo)) {
    throw new Error(`issues getting submodel ${objectName}`);
  }
  return new Mesh(geo, new MeshLambertMaterial({ color: 0xaa33cc }));
}
