import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { Entity } from "./Entity.js";
import { remap } from "./utils.js";
import { levitateSystem } from "./systems/levitateSystem.js";
import {
  calcPositionSystem,
  calcRotationSystem,
  calcScaleSystem,
} from "./systems/calcTransformSystem.js";
import { ageSystem } from "./systems/ageSystem.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import { jumpOnSelectedSystem } from "./systems/jumpOnSelectedSystem.js";
import { getAge } from "./components/AgeComponent.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "./systems/three_wrappers/THREEManager.js";

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
        render: {
          type: "3d model",
          refName: "head_top",
          objectName: "head_top",
        },
        position: { x: 0, y: 0, z: 0 },
      },
    },
    {
      id: "0",
      components: {
        render: {
          type: "3d model",
          refName: "head_top",
          objectName: "head_bottom",
        },
        position: { x: 0, y: 0, z: 0 },
      },
    },
  ],
  idCounter: 2,
};

function newDefaultEntity(id: string): Entity {
  const internalRoll = Math.random();
  const sign = Math.sign(remap(0, 1, -1, 1)(internalRoll));
  const pow = remap(0, 1, 0, 0.1)(internalRoll);
  const sizeFn = remap(0, 50, 0, 1, true);
  return {
    id,
    components: {
      color: { r: 1, g: 1, b: 1 },
      age: {},
      render: {
        type: "instanced 3d model",
        refName: "plane",
      },
      position: {
        x: 0,
        y: internalRoll,
        z: 0, // to prevent z-fighting
      },
      rotation: {
        style: "angle axis",
        amt: 0,
        axis: 1,
      },
      scale: {
        amt: 1,
      },
      calculateRotation: {
        calculation: (m, e) => {
          const t = m.input.entityUnderMouse === e.id ? 2 * m.time : m.time;
          return Math.sin(t / 12 + internalRoll * 100);
        },
      },
      calculatePosition: {
        calculation: (m, e) => {
          const t = e.components.age
            ? getAge(m.time, e.components.age)
            : model.time;
          const t2 = t;
          return {
            x: (sign * Math.pow(t2, 2) * pow) / 10,
            z: -t2 / 2,
          };
        },
      },
    },
  };
}

const blah = await getResolvedTHREEManager(new THREEManager());

type System = (model: Model) => Model;
type Systems = { [name: string]: System };
let systems: Systems = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  jumpOnSelectedSystem,
  ageSystem,
  wanderSystem,
  levitateSystem,
  calcRotationSystem,
  calcScaleSystem,
  calcPositionSystem,
  //reportSystem,
  addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(
    newDefaultEntity,
    10,
    100
  ),
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
