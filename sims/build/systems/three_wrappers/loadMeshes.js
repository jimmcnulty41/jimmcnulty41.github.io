import { DynamicDrawUsage, BufferGeometry, InstancedMesh, GridHelper, Vector3, Line, MeshLambertMaterial, Mesh, MeshBasicMaterial, PlaneGeometry, SphereGeometry, LineBasicMaterial, CircleGeometry, ShaderMaterial, Color, } from "../../vendor/three.js";
import { TextGeometry } from "../../vendor/TextGeometry.js";
import { FontLoader } from "../../vendor/FontLoader.js";
import { getBufferGeometryFromGLTF, getMeshFromGLTF, loadGLTFsInBg, } from "./loadGLTFs.js";
import { getTextureByName } from "./loadImages.js";
import { instanceIdToEntityId, registers } from "./threeOptimizations.js";
import { SHADERS } from "../../components/ShaderComponent.js";
const f = new FontLoader();
let font;
f.load("/assets/fonts/gentilis_bold.typeface.json", (res) => (font = res));
export const meshInitFuncs = {
    sphere: (tm) => new Mesh(new SphereGeometry(1, 12, 12), new MeshBasicMaterial({ color: 0x4400ff })),
    head_top: (tm) => tm.meshes["head_top"],
    head_bottom: (tm) => tm.meshes["head_bottom"],
    sketchbook_page: (tm, e) => new Mesh(new PlaneGeometry(10, 12, 2, 2).rotateX(-Math.PI / 3), new MeshBasicMaterial({
        map: getTextureByName(e.components.initRender?.pageName || ""),
    })),
    plane: (tm) => new Mesh(new PlaneGeometry(10, 12, 2, 2), new MeshBasicMaterial({ color: 0xff00ff })),
    grid: (tm) => new GridHelper(10, 10),
    line: (tm) => {
        return new Line(new BufferGeometry().setFromPoints([
            new Vector3(0, 0, 0),
            new Vector3(0, 10, 0),
        ]), new LineBasicMaterial({ color: 0x0000ff }));
    },
    circle: (tm) => {
        return new Mesh(new CircleGeometry(1.2, 12), new MeshBasicMaterial({ color: 0xaa33bb }));
    },
    text: (tm, e) => {
        const init = e.components.initRender;
        const mat = e.components.shader
            ? new ShaderMaterial({
                vertexShader: SHADERS[e.components.shader.key].vert,
                fragmentShader: SHADERS[e.components.shader.key].frag,
                uniforms: {
                    color: { value: new Color(0xff0000) },
                },
            })
            : new MeshBasicMaterial({ color: 0x2244ff });
        return new Mesh(new TextGeometry(init.text, { font, size: 1, height: 0.1 }), mat);
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
