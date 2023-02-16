import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { Entity } from "./Entity.js";
import { lerp, remap } from "./utils.js";
import { levitateSystem } from "./systems/levitateSystem.js";
import {
  calcPositionSystem,
  calcRotationSystem,
  calcScaleSystem,
} from "./systems/calcTransformSystem.js";
import { ageSystem } from "./systems/ageSystem.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import { jumpOnSelectedSystem } from "./systems/jumpOnSelectedSystem.js";
import { AgeComponent, getAge } from "./components/AgeComponent.js";
import { AngleAxisRotationComponent } from "./components/RotationComponent.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "./systems/three_wrappers/THREEManager.js";
import { initTHREEObjectSystem } from "./systems/three_wrappers/initTHREEObjectSystem.js";
import { wanderTowardSystem } from "./systems/wanderTowardSystem.js";

const disabledSystems = ["report"];

let model: Model = {
  time: 0,
  input: defaultInputComponent,
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
        calculatePosition: {
          calculation: (m, e) => {
            const t = m.time;
            const t2 = t - 20;
            if (t2 < 0) return { z: 0 };
            return { z: -t2 };
          },
        },
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

function newDefaultEntity(id: string): Entity {
  const roll = Math.random();
  const roll2 = Math.random();
  const randomSpot = {
    x: Math.random() * 10,
    y: Math.random() * 10,
    z: 0,
  };
  return {
    id,
    components: {
      age: {},
      initRender: {
        refName: "sketchbook_page",
      },
      wanderToward: {
        target: randomSpot,
        speed: roll * 200,
        friendliness: roll2,
      },
      position: {
        x: -randomSpot.y,
        y: randomSpot.x,
        z: 0,
      },
      rotation: {
        style: "angle axis",
        amt: 0,
        axis: 1,
      },
      scale: {
        amt: 1,
      },
    },
  };
}

const blah = await getResolvedTHREEManager(new THREEManager(true));

type System = (model: Model) => Model;
type Systems = { [name: string]: System };
let systems: Systems = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(newDefaultEntity, 10),
  jumpOnSelectedSystem,
  ageSystem,
  wanderSystem,
  levitateSystem,
  wanderTowardSystem,
  calcRotationSystem,
  calcScaleSystem,
  calcPositionSystem,
  initTHREEObject: (m) => initTHREEObjectSystem(blah, m),
  updateTHREEScene: (m) => updateTHREEScene(blah, m),
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
