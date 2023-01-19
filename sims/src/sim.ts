import * as THREE from "./vendor/three.js";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { Model } from "./Model.js";
import {
  initThreeScene,
  updateTHREEScene,
} from "./systems/updateTHREESceneSystem.js";
import { reportSystem } from "./systems/reportSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { Entity } from "./Entity.js";

function remap(min: number, max: number, newMin: number, newMax: number) {
  return (input: number) =>
    newMin + ((input - min) / (max - min)) * (newMax - newMin);
}

const disabledSystems = ["report"];

let systems: { [systemName: string]: System } = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  addEntityEveryNTicksSystem,
  wanderSystem,
  updateTHREEScene,
  reportSystem,
};

let model: Model = {
  time: 0,
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
  ],
  idCounter: 1,
  sceneMapping: {},
};
export function newDefaultEntity(id: string): Entity {
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

function update(globz: Globals) {
  window.requestAnimationFrame(() => update(globz));

  Object.keys(systems)
    .filter((s) => !disabledSystems.includes(s))
    .forEach((s) => {
      model = systems[s](model, globz);
    });
}

export interface Globals {
  window: Window;
  three: {
    scene: THREE.Scene;
    orbitControls: OrbitControls;
    renderer: THREE.Renderer;
    camera: THREE.Camera;
  };
}

type System = (model: Model, globz?: Globals) => Model;
type Systems = { [name: string]: System };

export function RunECS() {
  console.log("Simulation begins");
  update({ window, three: initThreeScene() });
}

RunECS();
