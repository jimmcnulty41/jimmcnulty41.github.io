import { Model } from "../../Model.js";
import { defaultInputComponent } from "../../components/InputComponent.js";
import {
  PerspectiveCamera,
  Color,
  Vector2,
  Raycaster,
  InstancedMesh,
} from "../../vendor/three.js";
import { instanceIdToEntityId } from "./threeOptimizations.js";

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

function onMouseDown(event: MouseEvent) {
  event.preventDefault();
}

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
  if (intersection.length <= 0) {
    return {
      ...model,
      input: { ...defaultInputComponent },
    };
  }

  const {
    instanceId,
    object: { name },
  } = intersection[0];

  if (instanceId === undefined) {
    return { ...model, input: { ...defaultInputComponent } };
  }

  if (meshes.instanceColor) {
    meshes.setColorAt(instanceId, highlight.setHex(0x0000ff));
    meshes.instanceColor.needsUpdate = true;
  }

  return {
    ...model,
    input: {
      entityUnderMouse: instanceIdToEntityId[name][`${instanceId}`],
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
