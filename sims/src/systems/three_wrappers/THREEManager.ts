import { OrbitControls } from "../../vendor/OrbitControls.js";
import { Camera, Renderer } from "../../vendor/three.js";
import {
  HemisphereLight,
  InstancedMesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  sRGBEncoding,
} from "../../vendor/three.js";
import { InstanceMeshes, getInstanceMeshes } from "../loadModels.js";
import { init } from "./inputSystem.js";

export type ResolvedTHREEManager = THREEManager & {
  instanceMeshes: InstanceMeshes;
};

export async function getResolvedTHREEManager(
  tm: THREEManager
): Promise<ResolvedTHREEManager> {
  while (tm.instanceMeshes === undefined) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return tm as ResolvedTHREEManager;
}

export class THREEManager {
  scene: Scene;
  canvas: HTMLCanvasElement;
  orbitControls: OrbitControls;
  camera: Camera;
  renderer: Renderer;

  instanceMeshes?: InstanceMeshes;

  constructor() {
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
    camera.position.set(0, 100, 1);
    camera.lookAt(0, 0, 0);

    const orbitControls = new OrbitControls(camera, canvas);

    getInstanceMeshes().then((result) => {
      this.instanceMeshes = result;
      const keys = Object.keys(this.instanceMeshes);
      keys.forEach((k) => {
        if (result[k]) {
          this.scene.add(result[k].inst);
        }
      });

      init(camera, this.instanceMeshes.plane.inst);
    });

    scene.add(new HemisphereLight(0xffffff, 0xff0033, 1));

    this.scene = scene;
    this.canvas = canvas;
    this.orbitControls = orbitControls;
    this.camera = camera;
    this.renderer = renderer;
  }
}
