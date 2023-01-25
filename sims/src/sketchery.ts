import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { Entity } from "./Entity.js";
import { remap } from "./utils.js";
import { levitateSystem } from "./systems/levitateSystem.js";

const disabledSystems = ["report"];

let model: Model = {
  time: 0,
  entities: [
    {
      id: "0",
      components: {
        render: {
          type: "grid",
        },
        position: { x: 0, y: 0, z: 0 },
      },
    },
    {
      id: "1",
      components: {
        render: {
          type: "grid",
        },
        position: { x: 100, y: 100, z: 100 },
      },
    },
  ],
  idCounter: 2,
};

function newDefaultEntity(id: string): Entity {
  const internalRoll = remap(0, 1, 0.1, 0.4)(Math.random());
  return {
    id,
    components: {
      levitate: {
        speed: Math.random(),
        roll: Math.random(),
      },
      render: { type: "3d model", refName: "plane" },
      position: {
        x: Math.random() * 100 - 50,
        y: 0,
        z: Math.random() * 100 - 50,
      },
      rotation: {
        dix: 0,
      },
      wander: {
        speed: Math.random(),
        directionIndex: 0,
        internalRoll,
        fsm: {
          nodes: ["forward", "turning"],
          edges: [
            {
              fromStateName: "forward",
              toStateName: "turning",
              shouldTransition: (roll: number) => {
                return roll < internalRoll / 12;
              },
            },
            {
              fromStateName: "turning",
              toStateName: "forward",
              shouldTransition: (roll: number) => {
                return roll < internalRoll * 2;
              },
            },
          ],
          current: "forward",
        },
      },
    },
  };
}

type System = (model: Model) => Model;
type Systems = { [name: string]: System };
let systems: Systems = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(newDefaultEntity, 1),
  wanderSystem,
  levitateSystem,
  //reportSystem,
  updateTHREEScene,
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
