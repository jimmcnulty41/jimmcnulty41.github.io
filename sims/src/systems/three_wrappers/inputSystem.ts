import { Model } from "../../Model.js";
import { InputComponent } from "../../components/InputComponent.js";
import { getTags } from "../../data/data_9.js";
import { Vector2, Raycaster, Mesh } from "../../vendor/three.js";
import { ResolvedTHREEManager } from "./THREEManager.js";
import {
  instanceIdToEntityId,
  sceneIdToEntityId,
} from "./threeOptimizations.js";

const raycaster = new Raycaster();
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
  const e = model.entities.find((e) => e.id === entityUnderMouse);
  const id = e?.components.render?.id;
  if (id) {
    // @ts-ignore
    const blah: HTMLImageElement = (tm.scene.children[id] as Mesh).material.map
      .source.data;
    const yadda = getTags(blah.src);
    const imgV = document.createElement("image-viewer");
    imgV.setAttribute("src", blah.src);
    imgV.setAttribute("tags", yadda);
    document.querySelector("body")?.appendChild(imgV);
  }
}
