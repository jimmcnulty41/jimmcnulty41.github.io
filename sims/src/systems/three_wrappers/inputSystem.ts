import { Model } from "../../Model.js";
import { defaultInputComponent } from "../../components/InputComponent.js";
import { Vector2, Raycaster } from "../../vendor/three.js";
import { ResolvedTHREEManager } from "./THREEManager.js";
import {
  instanceIdToEntityId,
  sceneIdToEntityId,
} from "./threeOptimizations.js";

const raycaster = new Raycaster();
const mouse_pos = new Vector2(1, 1);

window.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event: MouseEvent) {
  event.preventDefault();

  mouse_pos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse_pos.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event: MouseEvent) {
  event.preventDefault();

  console.log(event);
}

const emptyInput = {
  name: "",
  mouse: [0, 0],
};

export function inputSystem(tm: ResolvedTHREEManager, model: Model): Model {
  if (tm.meshes === null || tm.camera === null) {
    return {
      ...model,
      input: emptyInput,
    };
  }
  raycaster.setFromCamera(mouse_pos, tm.camera);

  const intersection = raycaster.intersectObject(tm.scene, true);
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
    object: { name, id },
  } = intersection[0];

  if (instanceId) {
    const prevEntityUnderMouse =
      model.input.entityUnderMouse !==
      instanceIdToEntityId[name][`${instanceId}`]
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
  } else {
    const prevEntityUnderMouse =
      model.input.entityUnderMouse === sceneIdToEntityId[id]
        ? undefined
        : model.input.entityUnderMouse;
    return {
      ...model,
      input: {
        prevEntityUnderMouse,
        entityUnderMouse: sceneIdToEntityId[id],
        mouse: [mouse_pos.x, mouse_pos.y],
      },
    };
  }
}
