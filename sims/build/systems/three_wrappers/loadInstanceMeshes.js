import { DynamicDrawUsage, InstancedMesh, MeshLambertMaterial, } from "../../vendor/three.js";
import { getBufferGeometry, getMesh } from "./loadGLTFs.js";
import { instanceIdToEntityId, registers } from "./threeOptimizations.js";
export async function getInstanceMeshes() {
    return {
        sphere: {
            inst: await getInstancedMesh("sphere"),
            idCounter: 0,
        },
        rat: {
            inst: await getInstancedMesh("rat"),
            idCounter: 0,
        },
        plane: {
            inst: await getInstancedMesh("plane"),
            idCounter: 0,
        },
    };
}
async function getInstancedMesh(refName) {
    const geo = await getBufferGeometry(refName);
    const instancedMesh = new InstancedMesh(geo, new MeshLambertMaterial({ color: 0xff00ff }), 10000);
    instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
    instancedMesh.count = 0;
    instancedMesh.name = refName;
    instanceIdToEntityId[instancedMesh.name] = {};
    instancedMesh.setColorAt(0, registers.color.setHex(0xffffff));
    if (instancedMesh.instanceColor === null) {
        throw new Error("instance color failed to instantiate");
    }
    instancedMesh.instanceColor.setUsage(DynamicDrawUsage); // will be updated every frame
    instancedMesh.instanceColor.needsUpdate = true;
    return instancedMesh;
}
export async function getMeshes() {
    return {
        head_top: await getMesh("head_top"),
        head_bottom: await getMesh("head_bottom"),
    };
}
