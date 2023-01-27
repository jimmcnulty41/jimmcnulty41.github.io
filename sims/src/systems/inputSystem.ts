import { Model } from "../Model";
import {
  PerspectiveCamera,
  Matrix4,
  Color,
  Vector2,
  Raycaster,
  InstancedMesh,
} from "../vendor/three.js";

const raycaster = new Raycaster();
const mouse_pos = new Vector2(1, 1);
let camera: PerspectiveCamera | null = null;
let meshes: InstancedMesh | null = null;

let highlight = new Color(0xffffff);

document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event: MouseEvent) {
  event.preventDefault();

  mouse_pos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse_pos.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

let matrix = new Matrix4();
const emptyInput = {
  name: "",
  mouse: [0, 0],
};

export function inputSystem(model: Model): Model {
  if (meshes === null || camera === null) {
    return {
      ...model,
      input: emptyInput,
    };
  }
  raycaster.setFromCamera(mouse_pos, camera);

  const intersection = raycaster.intersectObject(meshes);
  if (intersection.length > 0) {
    const instanceId = intersection[0].instanceId;

    if (instanceId !== undefined && meshes.instanceColor) {
      meshes.setColorAt(instanceId, highlight.setHex(0x0000ff));
      console.log(meshes.instanceColor || "poopoo");
      meshes.instanceColor.needsUpdate = true;
    }
    console.log(instanceId);
    return {
      ...model,
      input: {
        name: intersection[0].object.name,
        instanceIdUnderMouse: instanceId,
        mouse: [mouse_pos.x, mouse_pos.y],
      },
    };
  }

  return {
    ...model,
    input: {
      name: "unexpected -- a null value set in code not the name of part of a model",
      instanceIdUnderMouse: undefined,
      mouse: [mouse_pos.x, mouse_pos.y],
    },
  };
}

export function init(
  _camera: PerspectiveCamera,
  intersectionObjects: InstancedMesh
) {
  camera = _camera;
  meshes = intersectionObjects;
}
