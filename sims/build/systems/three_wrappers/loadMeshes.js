import { DynamicDrawUsage, BufferGeometry, InstancedMesh, GridHelper, Vector3, Line, MeshLambertMaterial, Mesh, MeshBasicMaterial, PlaneGeometry, SphereGeometry, LineBasicMaterial, } from "../../vendor/three.js";
import { getBufferGeometryFromGLTF, getMeshFromGLTF, loadGLTFsInBg, } from "./loadGLTFs.js";
import { getTextureByName } from "./loadImages.js";
import { instanceIdToEntityId, registers } from "./threeOptimizations.js";
export const meshInitFuncs = {
    sphere: (tm) => new Mesh(new SphereGeometry(1, 12, 12), new MeshBasicMaterial({ color: 0xff00ff })),
    head_top: (tm) => tm.meshes["head_top"],
    head_bottom: (tm) => tm.meshes["head_bottom"],
    sketchbook_page: (tm, pageName) => new Mesh(new PlaneGeometry(10, 12, 2, 2).rotateX(-Math.PI / 3), new MeshBasicMaterial({ map: getTextureByName(pageName) })),
    plane: (tm) => new Mesh(new PlaneGeometry(10, 12, 2, 2), new MeshBasicMaterial({ color: 0xff00ff })),
    grid: (tm) => new GridHelper(10, 10),
    line: (tm) => {
        console.log("drawing line");
        return new Line(new BufferGeometry().setFromPoints([
            new Vector3(0, 0, 0),
            new Vector3(0, 10, 0),
        ]), new LineBasicMaterial({ color: 0x0000ff }));
    },
};
loadGLTFsInBg([
    {
        path: "/assets/models/rat_2.2.gltf",
        refName: "rat",
        scale: [2, 2, 2],
    },
    {
        path: "/assets/models/self_portrait_2.gltf",
        refName: "head_top",
        objectNames: ["head_top", "head_bottom"],
        scale: [20, 20, 20],
    },
]);
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
export async function getMeshes() {
    return {
        head_top: await getMeshFromGLTF("head_top"),
        head_bottom: await getMeshFromGLTF("head_bottom"),
    };
}
async function getInstancedMesh(refName) {
    const geo = await getBufferGeometryFromGLTF(refName);
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
