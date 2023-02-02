import { OrbitControls } from "../../vendor/OrbitControls.js";
import { HemisphereLight, PerspectiveCamera, Scene, WebGLRenderer, sRGBEncoding, } from "../../vendor/three.js";
import { getInstanceMeshes } from "./loadMeshes.js";
import { getMeshes } from "./loadMeshes.js";
export async function getResolvedTHREEManager(tm) {
    while (tm.instanceMeshes === undefined || tm.meshes === undefined) {
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return tm;
}
export class THREEManager {
    scene;
    canvas;
    orbitControls;
    camera;
    renderer;
    instanceMeshes;
    meshes;
    constructor() {
        let scene = new Scene();
        const canvas = document.querySelector("canvas");
        if (!canvas)
            throw new Error("canvas not found on page");
        const renderer = new WebGLRenderer({ canvas });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = sRGBEncoding;
        const camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 100, 1);
        camera.lookAt(0, 0, 0);
        const orbitControls = new OrbitControls(camera, canvas);
        getMeshes().then((result) => {
            this.meshes = result;
        });
        getInstanceMeshes().then((result) => {
            this.instanceMeshes = result;
            const keys = Object.keys(this.instanceMeshes);
            keys.forEach((k) => {
                if (result[k]) {
                    this.scene.add(result[k].inst);
                }
            });
        });
        scene.add(new HemisphereLight(0xffffff, 0xff0033, 1));
        this.scene = scene;
        this.canvas = canvas;
        this.orbitControls = orbitControls;
        this.camera = camera;
        this.renderer = renderer;
    }
}
