import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/updateTHREESceneSystem.js";
import { reportSystem } from "./systems/reportSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { Entity } from "./Entity.js";

function remap(min: number, max: number, newMin: number, newMax: number) {
  return (input: number) =>
    newMin + ((input - min) / (max - min)) * (newMax - newMin);
}

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
  ],
  idCounter: 1,
};

function newDefaultEntity(id: string): Entity {
  return {
    id,
    components: {
      render: { type: "sphere" },
      position: { x: 0, y: 0, z: 0 },
      wander: {
        speed: Math.random(),
        directionIndex: 0,
        fsm: {
          nodes: ["forward", "turning"],
          edges: [
            {
              fromStateName: "forward",
              toStateName: "turning",
              shouldTransition: (roll) => {
                return roll < Math.random();
              },
            },
            {
              fromStateName: "turning",
              toStateName: "forward",
              shouldTransition: (roll) => {
                return roll < Math.random();
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
