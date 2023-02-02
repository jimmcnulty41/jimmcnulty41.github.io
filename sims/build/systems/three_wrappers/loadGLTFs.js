import { mergeBufferGeometries } from "../../vendor/BufferGeometryUtils.js";
import { GLTFLoader } from "../../vendor/GLTFLoader.js";
import { PlaneGeometry } from "../../vendor/three.js";
import { SphereGeometry } from "../../vendor/three.js";
const Geometries = {};
const Meshes = {};
Geometries["sphere"] = new SphereGeometry(1, 4, 4);
Geometries["plane"] = new PlaneGeometry(1, 1, 2, 2);
function getObj(g, name, scale) {
    const obj = g.scene.getObjectByName(name);
    if (!obj.isMesh) {
        throw new Error(`failed to load object ${name}`);
    }
    obj.geometry.computeVertexNormals();
    obj.geometry.scale(scale[0], scale[1], scale[2]);
    return obj;
}
function groupToBuffer(group, scale) {
    const meshes = [];
    group.traverse((c) => {
        if (c.isMesh) {
            meshes.push(c);
        }
    });
    const geos = meshes
        .map((m) => m.geometry)
        .map((x) => x.scale(scale[0], scale[1], scale[2]));
    const bufferGeometry = mergeBufferGeometries(geos);
    return bufferGeometry;
}
export async function loadGLTFsInBg(pathObjects) {
    const gltfLoader = new GLTFLoader();
    const loadCalls = pathObjects.map(({ path, refName, objectNames, scale }) => gltfLoader.loadAsync(path).then((g) => {
        if (objectNames) {
            // for now, we assume that if you specify object names, you also want
            // the provided data (i.e. materials, etc.)
            objectNames.forEach((objName) => (Meshes[objName] = getObj(g, objName, scale)));
        }
        else {
            Geometries[refName] = groupToBuffer(g.scene, scale);
        }
        return g;
    }));
    const gltfs = await Promise.all(loadCalls);
    console.log(`GLTFs loaded by ${performance.now()}`);
    console.log(gltfs);
}
export async function getBufferGeometryFromGLTF(refName) {
    while (!Geometries[refName]) {
        // hmm there's the opportunity for this never resolving and also not warning the user
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return Geometries[refName];
}
export async function getMeshFromGLTF(objectName) {
    while (!Meshes[objectName]) {
        // hmm there's the opportunity for this never resolving and also not warning the user
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return Meshes[objectName];
}
