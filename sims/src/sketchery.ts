import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { levitateSystem } from "./systems/levitateSystem.js";
import {
  calcPositionSystem,
  calcRotationSystem,
  calcScaleSystem,
} from "./systems/calcTransformSystem.js";
import { ageSystem } from "./systems/ageSystem.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import { jumpOnSelectedSystem } from "./systems/jumpOnSelectedSystem.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "./systems/three_wrappers/THREEManager.js";
import { initTHREEObjectSystem } from "./systems/three_wrappers/initTHREEObjectSystem.js";
import { getSortByTagSystem } from "./systems/sortByTagSystem.js";
import { sketchbook_page_in_spiral } from "./entityLibrary.js";

const disabledSystems = ["report"];

let model: Model = {
  time: 0,
  input: defaultInputComponent,
  cameraRotation: 0,
  entities: [
    // {
    //   id: "0",
    //   components: {
    //     render: {
    //       type: "grid",
    //     },
    //     position: { x: 0, y: 0, z: 0 },
    //   },
    // },
    {
      id: "1",
      components: {
        rotation: {
          style: "angle axis",
          axis: 1,
          amt: 0,
        },
        calculatePosition: [
          {
            calculation: (m, e) => {
              const t = m.time;
              const t2 = t - 20;
              if (t2 < 0) return { z: 0 };
              return { z: -t2 };
            },
          },
        ],
        calculateRotation: {
          calculation: (m, e) => {
            const t = m.time;
            return t;
          },
        },
        initRender: {
          refName: "head_top",
        },
        position: { x: 0, y: -10, z: 0 },
      },
    },
    {
      id: "0",
      components: {
        initRender: {
          refName: "head_bottom",
        },
        position: { x: 0, y: -10, z: 0 },
      },
    },
  ],
  idCounter: 2,
};

const tm = await getResolvedTHREEManager(
  new THREEManager({ enableOrbit: false })
);

type System = (model: Model) => Model;
type Systems = { [name: string]: System };
let systems: Systems = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  sortByTagSystem: getSortByTagSystem(tm),
  jumpOnSelectedSystem,
  ageSystem,
  wanderSystem,
  levitateSystem,
  calcRotationSystem,
  calcScaleSystem,
  calcPositionSystem,
  //reportSystem,
  addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(
    sketchbook_page_in_spiral,
    1,
    0,
    256
  ),
  initTHREEObject: (m) => initTHREEObjectSystem(tm, m),
  updateTHREEScene: (m) => updateTHREEScene(tm, m),
};

function RunECS() {
  console.log("Simulation begins");
  update();
}

function update() {
  window.requestAnimationFrame(() => update());

  Object.keys(systems)
    .filter((s) => !disabledSystems.includes(s))
    .forEach((s) => {
      model = systems[s](model);
    });
}

RunECS();
