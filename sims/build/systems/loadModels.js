import { mergeBufferGeometries } from "../vendor/BufferGeometryUtils.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";
import { DoubleSide, DynamicDrawUsage, Euler, IcosahedronGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry, Texture, Vector3, } from "../vendor/three.js";
import { getImage } from "./loadImages.js";
import { instanceIdToEntityId, registers, } from "./three_wrappers/threeOptimizations.js";
async function loadModels() {
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
    return (await Promise.all(gltfPaths.map(async ({ path, refName, scale }) => ({
        model: await gltfLoader.loadAsync(path),
        refName,
        scale,
    })))).reduce((memo, x) => ({
        ...memo,
        [x.refName]: {
            model: x.model,
            scale: x.scale,
        },
    }), {});
}
const GLTFs = await loadModels();
function getRegisters() {
    return {
        matrix: new Matrix4(),
        euler: new Euler(),
        vector: new Vector3(),
    };
}
export async function getInstanceMeshes() {
    const plane = await getInstancedPlane();
    return {
        sphere: {
            inst: getInstancedSphere(),
            idCounter: 0,
            registers: getRegisters(),
        },
        rat: {
            inst: getInstancedModel(),
            idCounter: 0,
            registers: getRegisters(),
        },
        plane: {
            inst: plane,
            idCounter: 0,
            registers: getRegisters(),
        },
    };
}
function groupToBuffer(group) {
    const meshes = [];
    group.traverse((c) => {
        if (c.isMesh) {
            meshes.push(c);
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
    const instancedMesh = new InstancedMesh(geo, new MeshLambertMaterial({ color: 0xff00ff }), 10000);
    instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
    instancedMesh.count = 0;
    instancedMesh.name = "rat";
    instanceIdToEntityId[instancedMesh.name] = {};
    return instancedMesh;
}
function getInstancedSphere() {
    const instancedMesh = new InstancedMesh(new IcosahedronGeometry(10, 3), new MeshBasicMaterial({ color: 0xffffff }), 10000);
    instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
    instancedMesh.count = 0;
    instancedMesh.name = "sphere";
    instanceIdToEntityId[instancedMesh.name] = {};
    return instancedMesh;
}
async function getInstancedPlane() {
    const instanceCount = 1000;
    const geo = new PlaneGeometry(12, 10, 2, 2);
    geo.rotateX(Math.PI / 2);
    geo.rotateY(Math.PI / 2);
    const tex = new Texture();
    tex.image = await getImage(0);
    tex.needsUpdate = true;
    const instancedMesh = new InstancedMesh(geo, new MeshBasicMaterial({ map: tex, side: DoubleSide }), instanceCount);
    instancedMesh.count = 0;
    instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
    instancedMesh.setColorAt(0, registers.color.setHex(0xffffff));
    //@ts-ignore
    instancedMesh.instanceColor.setUsage(DynamicDrawUsage); // will be updated every frame
    //@ts-ignore
    instancedMesh.instanceColor.needsUpdate = true;
    instancedMesh.name = "plane";
    instanceIdToEntityId[instancedMesh.name] = {};
    return instancedMesh;
}
function isBufferGeometry(blah) {
    return blah.isBufferGeometry;
}
export function getSubmodel(refName, objectName) {
    const gltf = GLTFs[refName];
    const group = gltf.model.scene;
    let geo = null;
    if (objectName !== undefined) {
        geo = gltf.model.scene.getObjectByName(objectName);
        if (geo.isMesh) {
            geo.geometry.computeVertexNormals();
            geo.geometry.scale(gltf.scale[0], gltf.scale[1], gltf.scale[2]);
            return geo;
        }
    }
    else {
        geo = groupToBuffer(group);
    }
    if (!isBufferGeometry(geo)) {
        throw new Error(`issues getting submodel ${objectName}`);
    }
    return new Mesh(geo, new MeshLambertMaterial({ color: 0xaa33cc }));
}
