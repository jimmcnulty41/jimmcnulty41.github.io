import * as THREE from "./vendor/three.js";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { StateMachine } from "./StateMachine.js";
import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/updateTHREESceneSystem.js";
import { reportSystem } from "./systems/reportSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";

export let scene = new THREE.Scene();
const canvas = document.querySelector("canvas");
if (!canvas) throw new Error("canvas not found on page");

const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setSize(window.innerWidth, window.innerHeight);
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);
export const orbitControls = new OrbitControls(camera, canvas);

function start() {
  console.log("Simulation begins");
  update();
}

function remap(min: number, max: number, newMin: number, newMax: number) {
  return (input: number) =>
    newMin + ((input - min) / (max - min)) * (newMax - newMin);
}

function getGrid() {
  return new THREE.GridHelper(100, 10, 0xff0000);
}

export function createObject({ type }: RenderComponent) {
  switch (type) {
    case "sphere":
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      return mesh;
    case "grid":
      return getGrid();
  }
}

export const dirs = [
  [0, 0, 1],
  [0, 0, -1],
  [1, 0, 0],
  [-1, 0, 0],
] as const;

type Dirs = typeof dirs[0];

type WanderStates = "forward" | "turning";

interface WanderComponent {
  directionIndex: number;
  speed: number;

  fsm: StateMachine<WanderStates>;
}

interface PositionComponent {
  x: number;
  y: number;
  z: number;
}

interface SphereRenderComponent {
  type: "sphere";
}
interface GridRenderComponent {
  type: "grid";
}

type RenderComponent = SphereRenderComponent | GridRenderComponent;

type RenderableEntity = Entity & {
  components: Components & {
    render: RenderComponent;
    position: PositionComponent;
  };
};

export type WanderingEntity = Entity & {
  components: Components & {
    wander: WanderComponent;
    position: PositionComponent;
  };
};

type PositionedEntity = Entity & {
  components: Components & { position: PositionComponent };
};

export function isRenderable(entity: Entity): entity is RenderableEntity {
  return (
    entity.components.render !== undefined &&
    entity.components.position !== undefined
  );
}

export function canWander(entity: Entity): entity is WanderingEntity {
  return (
    entity.components.wander !== undefined &&
    entity.components.position !== undefined
  );
}

export function isPositioned(entity: Entity): entity is PositionedEntity {
  return entity.components.position !== undefined;
}

type ComponentTypes = {
  wander: WanderComponent;
  position: PositionComponent;
  render: RenderComponent;
};

type Components = {
  [K in keyof ComponentTypes]?: ComponentTypes[K];
};

export interface Entity {
  id: string;
  components: Components;
}

const disabledSystems = ["report"];

let systems: { [systemName: string]: (model: Model) => Model } = {
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

function update() {
  window.requestAnimationFrame(() => update());

  Object.keys(systems)
    .filter((s) => !disabledSystems.includes(s))
    .forEach((s) => {
      model = systems[s](model);
    });

  renderer.render(scene, camera);
}

start();
