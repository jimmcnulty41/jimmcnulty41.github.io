import { OrbitControls } from "../../vendor/OrbitControls.js";
import {} from "../../vendor/three.js";
import {
  Camera,
  Mesh,
  Renderer,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  sRGBEncoding,
} from "../../vendor/three.js";
import { InstanceMeshes, Meshes, getInstanceMeshes } from "./loadMeshes.js";
import { getMeshes } from "./loadMeshes.js";

export type ResolvedTHREEManager = THREEManager & {
  instanceMeshes: InstanceMeshes;
  meshes: Meshes;
};
export async function getResolvedTHREEManager(
  tm: THREEManager
): Promise<ResolvedTHREEManager> {
  while (tm.instanceMeshes === undefined || tm.meshes === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return tm as ResolvedTHREEManager;
}

interface CameraConfig {}

export class THREEManager {
  scene: Scene;
  canvas: HTMLCanvasElement;
  orbitControls?: OrbitControls;
  camera: Camera;
  renderer: Renderer;

  instanceMeshes?: InstanceMeshes;
  meshes?: Meshes;

  constructor(enableOrbit: boolean) {
    let scene = new Scene();

    const canvas = document.querySelector("canvas");
    if (!canvas) throw new Error("canvas not found on page");

    const renderer = new WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding;

    const camera = new PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 115, -25);
    camera.lookAt(0, 0, -25);

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

    this.scene = scene;
    this.canvas = canvas;
    this.camera = camera;
    this.renderer = renderer;
  }
}
