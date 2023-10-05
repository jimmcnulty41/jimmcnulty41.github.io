import { Model } from "../lib/Model.js";
import { defaultInputComponent } from "../components/InputComponent.js";
import { initTHREEObjectSystem } from "../systems/three_wrappers/initTHREEObjectSystem.js";
import { updateTHREEScene } from "../systems/three_wrappers/updateTHREESceneSystem.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "../systems/three_wrappers/THREEManager.js";

let model: Model = {
  time: 0,
  entities: [
    {
      id: "0",
      components: {
        // render: {
        //   refName: "grid",
        // },
        position: { x: 0, y: 0, z: 0 },
      },
    },
  ],
  idCounter: 0,
  input: defaultInputComponent,
  cameraRotation: 0,
  achievements: [],
  toasts: [],
};

const tm = await getResolvedTHREEManager(
  new THREEManager({ enableOrbit: true, cameraPos: [100, 100, 200] })
);

type System = (model: Model) => Model;
type Systems = { [name: string]: System };
let systems: Systems = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  //reportSystem,
  initTHREEScene: (m) => initTHREEObjectSystem(tm, m),
  updateTHREEScene: (m) => updateTHREEScene(tm, m),
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
