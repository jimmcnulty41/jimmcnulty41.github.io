import * as THREE from "./vendor/three.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

let scene = new THREE.Scene();
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
const orbitControls = new OrbitControls(camera, canvas);

interface StateMachine<States> {
  nodes: States[];
  edges: StateTransition<States>[];
  current: States;
}
interface StateTransition<States> {
  fromStateName: States;
  toStateName: States;
  shouldTransition: (roll: number) => Boolean;
}

function updateStateMachine(machine: StateMachine<any>, roll: number) {
  const transition = machine.edges.find(
    (t) => t.fromStateName === machine.current && t.shouldTransition(roll)
  );
  if (!transition) {
    return machine;
  }
  return {
    ...machine,
    current: transition.toStateName,
  };
}

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

function createObject({ type }: RenderComponent) {
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

const dirs = [
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

type WanderingEntity = Entity & {
  components: Components & {
    wander: WanderComponent;
    position: PositionComponent;
  };
};

type PositionedEntity = Entity & {
  components: Components & { position: PositionComponent };
};

function isRenderable(entity: Entity): entity is RenderableEntity {
  return (
    entity.components.render !== undefined &&
    entity.components.position !== undefined
  );
}

function canWander(entity: Entity): entity is WanderingEntity {
  return (
    entity.components.wander !== undefined &&
    entity.components.position !== undefined
  );
}

function isPositioned(entity: Entity): entity is PositionedEntity {
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

interface Entity {
  id: string;
  components: Components;
}

interface Model {
  time: number;
  entities: Entity[];
  idCounter: number;
  sceneMapping: {
    [entityID: string]: number;
  };
}

const disabledSystems = ["report"];

let systems: { [systemName: string]: (model: Model) => Model } = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  addEntityEveryNTicks: (model) =>
    model.time % 3 || model.entities.length > 100
      ? model
      : {
          ...model,
          entities: [...model.entities, newDefaultEntity(`${model.idCounter}`)],
          idCounter: model.idCounter + 1,
        },
  wander: (model): Model => {
    function entityWander(e: WanderingEntity, i: number): Entity {
      let { position, wander, ...unaffectedComponents } = e.components;
      const dix = wander.directionIndex;

      if (wander.fsm.current === "forward") {
        position = {
          x: position.x + wander.speed * dirs[dix][0],
          y: position.y + wander.speed * dirs[dix][1],
          z: position.z + wander.speed * dirs[dix][2],
        };
      } else if (wander.fsm.current === "turning") {
        wander = {
          ...wander,
          directionIndex: (dix + 1) % dirs.length,
        };
      }

      wander.fsm = updateStateMachine(e.components.wander.fsm, Math.random());

      return {
        ...e,
        components: {
          ...unaffectedComponents,
          position,
          wander,
        },
      };
    }

    return {
      ...model,
      entities: [
        ...model.entities.filter(canWander).map(entityWander),
        ...model.entities.filter((x) => !canWander(x)),
      ],
    };
  },
  report: (model) => {
    const positions = model.entities
      .filter(isPositioned)
      .map((e) => e.components.position);

    const posSum = positions.reduce(
      (sum, p) => ({
        x: sum.x + p.x,
        y: sum.y + p.y,
        z: sum.z + p.z,
      }),
      { x: 0, y: 0, z: 0 }
    );

    console.log(
      `${(posSum.x / positions.length).toFixed(2)} ${(
        posSum.y / positions.length
      ).toFixed(2)} ${(posSum.z / positions.length).toFixed(2)}`
    );
    return model;
  },
  updateTHREEScene: (model) => {
    const sceneMapping = { ...model.sceneMapping };

    model.entities.filter(isRenderable).forEach((e) => {
      if (!isRenderable(e)) {
        return;
      }
      if (!sceneMapping[e.id]) {
        // instance in scene
        const object = createObject(e.components.render);
        scene.add(object);
        sceneMapping[e.id] = object.id;
      } else {
        const childIdx = scene.children.findIndex(
          (c) => c.id === sceneMapping[e.id]
        );
        scene.children[childIdx].position.set(
          e.components.position.x,
          e.components.position.y,
          e.components.position.z
        );
      }
    });

    orbitControls.update();
    return {
      ...model,
      sceneMapping,
    };
  },
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
