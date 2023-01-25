import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { Entity } from "./Entity.js";
import { remap } from "./utils.js";

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
  const internalRoll = remap(0, 1, 0.1, 0.4)(Math.random());
  return {
    id,
    components: {
      render: { type: "3d model", refName: "plane" },
      position: {
        x: Math.random() * 100 - 50,
        y: 0,
        z: Math.random() * 100 - 50,
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
