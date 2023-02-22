import { Model } from "./Model.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "./systems/three_wrappers/THREEManager.js";
import { initTHREEObjectSystem } from "./systems/three_wrappers/initTHREEObjectSystem.js";
import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";

const blah = await getResolvedTHREEManager(new THREEManager(false));
let model: Model = {
  time: 0,
  input: defaultInputComponent,
  entities: [],
  idCounter: 0,
};
type System = (model: Model) => Model;
type Systems = { [name: string]: System };
let systems: Systems = {
  blaya: (m) => {
    if (m.time !== 0) return m;
    m.entities.push({
      id: "1",
      components: {
        position: {
          x: blah.screenToWorld({ x: -1, y: 0 }).x,
          y: 0,
          z: blah.screenToWorld({ x: 0, y: 1 }).z,
        },
        scale: {
          amt: 4,
        },
        initRender: {
          refName: "sphere",
        },
      },
    });
    return m;
  },
  initTHREEObject: (m) => initTHREEObjectSystem(blah, m),
  updateTHREEScene: (m) => updateTHREEScene(blah, m),
};
function RunECS() {
  console.log("Simulation begins");
  update();
}

function update() {
  window.requestAnimationFrame(() => update());

  Object.keys(systems).forEach((s) => {
    model = systems[s](model);
  });
}

RunECS();
