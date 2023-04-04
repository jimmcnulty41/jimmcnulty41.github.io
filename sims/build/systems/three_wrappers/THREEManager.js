import { OrbitControls } from "../../vendor/OrbitControls.js";
import { OrthographicCamera, Plane, Raycaster, Vector3, } from "../../vendor/three.js";
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
    raycaster;
    screenToWorld;
    constructor({ enableOrbit, ortho, cameraPos, }) {
        let scene = new Scene();
        const canvas = document.querySelector("canvas");
        if (!canvas)
            throw new Error("canvas not found on page");
        const renderer = new WebGLRenderer({ canvas });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = sRGBEncoding;
        const camera = ortho
            ? new OrthographicCamera(-10, 10, 10, -10, 0.1, 1000)
            : new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
        if (cameraPos) {
            camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);
        }
        else {
            camera.position.set(0, 115, -25);
        }
        camera.layers.enable(1);
        camera.lookAt(0, 0, 0);
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
        if (enableOrbit) {
            const orbitControls = new OrbitControls(camera, canvas);
            this.orbitControls = orbitControls;
        }
        this.raycaster = new Raycaster();
        this.scene = scene;
        this.canvas = canvas;
        this.camera = camera;
        this.renderer = renderer;
        this.screenToWorld = (p) => sicikery(this.raycaster, this.camera, p);
    }
}
function sicikery(raycaster, camera, pos) {
    camera.updateWorldMatrix(false, false);
    raycaster.setFromCamera(pos, camera);
    const target = new Vector3();
    raycaster.ray.intersectPlane(new Plane(new Vector3(0, 1, 0), 0), target);
    return target;
}
