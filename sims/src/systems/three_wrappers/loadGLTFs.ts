import { mergeBufferGeometries } from "../../vendor/BufferGeometryUtils.js";
import { GLTF, GLTFLoader } from "../../vendor/GLTFLoader.js";
import { PlaneGeometry } from "../../vendor/three.js";
import { SphereGeometry } from "../../vendor/three.js";
import { BufferGeometry, Group, Mesh } from "../../vendor/three.js";

const Geometries: { [refName: string]: BufferGeometry } = {};
const Meshes: { [objectName: string]: Mesh } = {};

Geometries["sphere"] = new SphereGeometry(1, 4, 4);
Geometries["plane"] = new PlaneGeometry(1, 1, 2, 2);

function getObj(g: GLTF, name: string, scale: number[]): Mesh {
  const obj = g.scene.getObjectByName(name);
  if (!(obj as Mesh).isMesh) {
    throw new Error(`failed to load object ${name}`);
  }
  (obj as Mesh).geometry.computeVertexNormals();
  (obj as Mesh).geometry.scale(scale[0], scale[1], scale[2]);

  return obj as Mesh;
}

function groupToBuffer(group: Group, scale: number[]): BufferGeometry {
  const meshes: Mesh[] = [];
  group.traverse((c) => {
    if ((c as Mesh).isMesh) {
      meshes.push(c as Mesh);
    }
  });
  const geos = meshes
    .map((m) => m.geometry as BufferGeometry)
    .map((x) => x.scale(scale[0], scale[1], scale[2]));
  const bufferGeometry = mergeBufferGeometries(geos);
  return bufferGeometry;
}

interface Blah {
  path: string;
  refName: string;
  scale: number[];
  objectNames?: string[];
}
export async function loadGLTFsInBg(pathObjects: Blah[]) {
  const gltfLoader = new GLTFLoader();
  const loadCalls = pathObjects.map(({ path, refName, objectNames, scale }) =>
    gltfLoader.loadAsync(path).then((g: GLTF) => {
      if (objectNames) {
        // for now, we assume that if you specify object names, you also want
        // the provided data (i.e. materials, etc.)
        objectNames.forEach(
          (objName) => (Meshes[objName] = getObj(g, objName, scale))
        );
      } else {
        Geometries[refName] = groupToBuffer(g.scene, scale);
      }
      return g;
    })
  );

  const gltfs = await Promise.all(loadCalls);
  console.log(`GLTFs loaded by ${performance.now()}`);
}

export async function getBufferGeometryFromGLTF(
  refName: string
): Promise<BufferGeometry> {
  while (!Geometries[refName]) {
    // hmm there's the opportunity for this never resolving and also not warning the user
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return Geometries[refName];
}

export async function getMeshFromGLTF(objectName: string): Promise<Mesh> {
  while (!Meshes[objectName]) {
    // hmm there's the opportunity for this never resolving and also not warning the user
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return Meshes[objectName];
}
