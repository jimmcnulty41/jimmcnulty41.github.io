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

window.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event: MouseEvent) {
  event.preventDefault();

  mouse_pos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse_pos.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

let tmp_model: Model | null = null;

function onMouseDown(event: MouseEvent) {
  event.preventDefault();

  console.log(tmp_model);
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
      input: {
        ...defaultInputComponent,
        prevEntityUnderMouse: model.input.entityUnderMouse,
      },
    };
  }

  const {
    instanceId,
    object: { name },
  } = intersection[0];

  tmp_model = model;

  const prevEntityUnderMouse =
    model.input.entityUnderMouse !== instanceIdToEntityId[name][`${instanceId}`]
      ? model.input.entityUnderMouse
      : undefined;

  return {
    ...model,
    input: {
      prevEntityUnderMouse,
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
