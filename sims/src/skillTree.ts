import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";
import { reportSystem } from "./systems/reportSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { Entity } from "./Entity.js";
import { mapToCurve, octreeCurve, remap } from "./utils.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "./systems/three_wrappers/THREEManager.js";
import { initTHREEObjectSystem } from "./systems/three_wrappers/initTHREEObjectSystem.js";
import { StateMachine } from "./StateMachine.js";
import { CalcPositionComponent } from "./components/CalcTransformComponents.js";
import {
  calcPositionSystem,
  calcRotationSystem,
} from "./systems/calcTransformSystem.js";
import { EntityWith } from "./components/Components.js";

const disabledSystems = ["report"];

let model: Model = {
  time: 0,
  entities: [
    {
      id: "0",
      components: {
        initRender: { refName: "grid" },
        position: { x: 0, y: 0, z: 0 },
      },
    },
  ],
  idCounter: 1,
  input: defaultInputComponent,
  cameraRotation: 0,
};

const DATA = [
  {
    skillName: "CSS",
    examples: ["climb", "extrahop", "epic", "imageViewer"],
  },
  {
    skillName: "HTML",
    examples: ["climb", "extrahop", "epic", "imageViewer"],
  },
  {
    skillName: "Hand Sawing",
    examples: ["the tower", "the bed", "the roach motel", "the desk"],
  },
  {
    skillName: "Machine sawing",
    examples: ["the triangles"],
  },
  {
    skillName: "Ropes",
    examples: ["the tower"],
  },
  {
    skillName: "Illustration",
    examples: ["sketchery"],
  },
  {
    skillName: "Animation",
    examples: ["jim.mcnulty.site/gifs", "squatbot", "404page"],
  },
  {
    skillName: "d3",
    examples: ["observable"],
  },
  {
    skillName: "react",
    examples: ["extrahop", "climb"],
  },
  {
    skillName: "webComponents",
    examples: ["imageViewer"],
  },
  {
    skillName: "javascript",
    examples: ["imageViewer", "climb", "extrahop"],
  },
];

interface Node {
  id: string;
}
interface Edge {
  name: string;
  from: string;
  to: string;
}

function dataWithSkillNodes(data: typeof DATA) {
  const nodes = data.map((s) => ({ id: s.skillName }));

  const edgeNames = Object.keys(
    DATA.reduce((names, d) => {
      let additions: { [blah: string]: string } = {};
      d.examples.forEach((e) => {
        additions[e] = "";
      });
      return { ...names, ...additions };
    }, {})
  );

  const edges: Edge[] = edgeNames.flatMap((n) => {
    const nodesToConnect = data.filter((d) => d.examples.includes(n));
    if (nodesToConnect.length <= 1) return [] as Edge[];

    const firstSet = nodesToConnect.slice(0, -1);
    const secondSet = nodesToConnect.slice(1);
    return firstSet.map((f, i) => ({
      name: n,
      from: f.skillName,
      to: secondSet[i].skillName,
    }));
  });

  return { nodes, edges };
}

function getEntities(model: Model): Model {
  let id = model.idCounter;

  const graph = dataWithSkillNodes(DATA);

  const points = mapToCurve([...Array(graph.nodes.length)].map((x) => ({})));

  function wiggle(time: number, id: number): [number, number, number] {
    let speed = 371;
    return [
      Math.sin(time / 300 + id) / speed,
      Math.cos(time / 271 + id) / speed,
      Math.sin(time / 287 + id) / speed,
    ];
  }
  let nameToId: { [blah: string]: number } = {};

  const nodeEntities: Entity[] = graph.nodes
    .map((n) => {
      const curId = id++;
      nameToId[n.id] = curId;
      return {
        id: `${curId}`,
        components: {
          initRender: { refName: "sphere" },
        },
      };
    })
    .map((x, i) => {
      const { ...others } = x;
      return {
        ...others,
        components: {
          ...others.components,
          position: {
            x: points[i].position[0],
            y: points[i].position[1],
            z: points[i].position[2],
          },

          calculatePosition: [
            {
              calculation: (m, e) => ({
                x:
                  e.components.position.x +
                  wiggle(m.time, Number.parseInt(e.id))[0],
                y:
                  e.components.position.y +
                  wiggle(m.time, Number.parseInt(e.id))[1],

                z:
                  e.components.position.z +
                  wiggle(m.time, Number.parseInt(e.id))[2],
              }),
            } as CalcPositionComponent,
          ],
        },
      };
    });
  const edgeEntities = graph.edges.map((edge, i) => {
    return {
      id: `${id++}`,
      components: {
        initRender: {
          refName: "line",
          from: nameToId[edge.from],
          to: nameToId[edge.to],
        },
        position: {
          x: points[i].position[0],
          y: points[i].position[1],
          z: points[i].position[2],
        },
      },
    };
  });

  const textEntities: Entity[] = graph.nodes.map((n, i) => ({
    id: `${id++}`,
    components: {
      initRender: {
        refName: "circle",
      },
      position: {
        x: points[i].position[0],
        y: points[i].position[1],
        z: points[i].position[2],
      },
      rotation: {
        amt: Math.PI,
        style: "angle axis",
        axis: 1,
      },
      calculateRotation: {
        calculation: (model: Model, entity: Entity) => {
          console.log(model.cameraRotation);
          return model.cameraRotation;
        },
      },
      calculatePosition: [
        {
          calculation: (m: Model, e: EntityWith<"position">) => {
            const blah = m.entities.find((e) => e.id === `${nameToId[n.id]}`);
            if (!blah) throw new Error("fuck");
            return { ...blah.components.position };
          },
        },
      ],
    },
  }));

  return {
    ...model,
    idCounter: id,
    entities: [
      ...model.entities,
      ...nodeEntities,
      ...edgeEntities,
      ...textEntities,
    ],
  };
}

function newDefaultEntity(id: string): Entity {
  const internalRoll = remap(0, 1, 0.1, 0.4)(Math.random());
  return {
    id,
    components: {
      initRender: { refName: "rat" },
      color: {
        r: 0.5,
        g: 0.5,
        b: 0.2,
      },
      rotation: {
        style: "standard",
        dix: 0,
      },
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

const tm = await getResolvedTHREEManager(
  new THREEManager({ enableOrbit: true, ortho: true })
);

type System = (model: Model) => Model;
type Systems = { [name: string]: System };
let systems: Systems = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  calcPositionSystem,
  calcRotationSystem,
  initTHREEScene: (m) => initTHREEObjectSystem(tm, m),
  updateTHREEScene: (m) => updateTHREEScene(tm, m),
};

function RunECS() {
  console.log("Simulation begins");
  model = getEntities(model);
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
