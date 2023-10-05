import {
  Camera,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
} from "../../vendor/three.js";
import { InputComponent } from "../../components/InputComponent.js";
import { Model } from "../../lib/Model.js";
import { ResolvedTHREEManager } from "./THREEManager.js";
import {
  instanceIdToEntityId,
  sceneIdToEntityId,
} from "./threeOptimizations.js";

const raycaster = new Raycaster();
raycaster.layers.set(0);
const mouse_pos = new Vector2(1, 1);
let mouseState = "whatevs";

window.addEventListener("mousedown", onMouseDown);
window.addEventListener("touchstart", onTouch);
document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event: MouseEvent) {
  event.preventDefault();
  if ((event.target as HTMLElement)?.localName !== "canvas") {
    return;
  }
  mouse_pos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse_pos.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function onTouch(event: TouchEvent) {
  event.preventDefault();

  if ((event.target as HTMLElement)?.localName !== "canvas") {
    return;
  }
  mouse_pos.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  mouse_pos.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  mouseState = "down";
  requestAnimationFrame(() => (mouseState = "whatevs"));
}
function onMouseDown(event: MouseEvent) {
  event.preventDefault();
  if ((event.target as HTMLElement)?.localName !== "canvas") {
    return;
  }
  mouseState = "down";
  requestAnimationFrame(() => (mouseState = "whatevs"));
}

const emptyInput: InputComponent = {
  mouse: [0, 0],
  mouseState: "whatevs",
};

export function inputSystem(tm: ResolvedTHREEManager, model: Model): Model {
  if (tm.meshes === null || tm.camera === null) {
    return {
      ...model,
      input: emptyInput,
    };
  }
  raycaster.setFromCamera(mouse_pos, tm.camera);
  const v = new Vector3();

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
      handleDown(tm, model, entityUnderMouse);
    }

    return {
      ...model,
      input: {
        mouseState: "whatevs",
        prevEntityUnderMouse,
        entityUnderMouse: instanceIdToEntityId[name][`${instanceId}`],
        mouse: [mouse_pos.x, mouse_pos.y],
      },
    };
  } else {
    const entityUnderMouse = sceneIdToEntityId[id];
    if (mouseState === "down") {
      handleDown(tm, model, entityUnderMouse);
    }

    const prevEntityUnderMouse =
      model.input.entityUnderMouse === entityUnderMouse
        ? undefined
        : model.input.entityUnderMouse;
    return {
      ...model,
      input: {
        mouseState: "whatevs",
        prevEntityUnderMouse,
        entityUnderMouse: sceneIdToEntityId[id],
        mouse: [mouse_pos.x, mouse_pos.y],
      },
    };
  }
}

function handleDown(
  tm: ResolvedTHREEManager,
  model: Model,
  entityUnderMouse: string
) {
  const entity = model.entities.find((e) => e.id === entityUnderMouse);
  if (!entity || !entity.components.render) {
    throw new Error(`invalid entity under mouse: ${entityUnderMouse}`);
  }
  document.dispatchEvent(
    new CustomEvent("JIM_entityClick", { detail: entity })
  );
}

function getBounds(scene: Scene, camera: Camera): Vector3[] {
  const target = new Vector3();
  return [target];
}
