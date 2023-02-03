import { Model } from "../../Model.js";
import { InputComponent } from "../../components/InputComponent.js";
import { Vector2, Raycaster } from "../../vendor/three.js";
import { ResolvedTHREEManager } from "./THREEManager.js";
import {
  instanceIdToEntityId,
  sceneIdToEntityId,
} from "./threeOptimizations.js";

const raycaster = new Raycaster();
const mouse_pos = new Vector2(1, 1);
let mouseState = "whatevs";

window.addEventListener("mousedown", onMouseDown);
document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event: MouseEvent) {
  event.preventDefault();

  mouse_pos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse_pos.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event: MouseEvent) {
  event.preventDefault();

  mouseState = "down";
  setInterval(() => (mouseState = "whatevs"), 10);
}

const emptyInput: InputComponent = {
  mouse: [0, 0],
  mouseState: "whatevs",
};

// function setSpecialImageElement() {
//   const special = document.querySelector("#featured") as HTMLImageElement;
//   special.src =
//   mouseState = "whatevs";
// }

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
        ...emptyInput,
        prevEntityUnderMouse: model.input.entityUnderMouse,
      },
    };
  }

  const {
    instanceId,
    object: { name, id },
  } = intersection[0];

  if (instanceId) {
    const entityUnderMouse = instanceIdToEntityId[name][`${instanceId}`];
    const prevEntityUnderMouse =
      model.input.entityUnderMouse !== entityUnderMouse
        ? model.input.entityUnderMouse
        : undefined;

    if (mouseState === "down") {
      console.log(model.entities.find((e) => e.id === entityUnderMouse));
    }

    return {
      ...model,
      input: {
        mouseState,
        prevEntityUnderMouse,
        entityUnderMouse: instanceIdToEntityId[name][`${instanceId}`],
        mouse: [mouse_pos.x, mouse_pos.y],
      },
    };
  } else {
    const entityUnderMouse = sceneIdToEntityId[id];
    if (mouseState === "down") {
      console.log(model.entities.find((e) => e.id === entityUnderMouse));
    }
    const prevEntityUnderMouse =
      model.input.entityUnderMouse === entityUnderMouse
        ? undefined
        : model.input.entityUnderMouse;
    return {
      ...model,
      input: {
        mouseState,
        prevEntityUnderMouse,
        entityUnderMouse: sceneIdToEntityId[id],
        mouse: [mouse_pos.x, mouse_pos.y],
      },
    };
  }
}
