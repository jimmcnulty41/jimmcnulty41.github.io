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
import { PROJECT_PAGES, SKILL_DATA } from "./data/skillData.js";

const disabledSystems = ["report"];

const iframe = document.querySelector("iframe");
if (!iframe) throw new Error("forgot to add iframe to html");

document.addEventListener("JIM_entityClick", (event) => {
  const entity: Entity = (event as CustomEvent).detail;
  const name = entity.components.metadata?.name || "";
  const pageUrl = PROJECT_PAGES[name];
  console.log(pageUrl);
  if (!pageUrl) return;

  iframe.src = pageUrl;
});

document.addEventListener("JIM_x", (event) => {
  iframe.src = "";
});

let model: Model = {
  time: 0,
  entities: [
    // {
    //   id: "0",
    //   components: {
    //     initRender: { refName: "grid" },
    //     position: { x: 0, y: 0, z: 0 },
    //   },
    // },
  ],
  idCounter: 0,
  input: defaultInputComponent,
  cameraRotation: 0,
};

interface Node {
  name: string;
}
interface Edge {
  name: string;
  from: string;
  to: string;
}

function dataWithSkillNodes(data: typeof SKILL_DATA) {
  const nodes: Node[] = data.map((s) => ({ name: s.skillName }));

  const edgeNames = Object.keys(
    data.reduce((names, d) => {
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

  const graph = dataWithSkillNodes(SKILL_DATA);

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
    .map(({ name }) => {
      const curId = id++;
      nameToId[name] = curId;
      return {
        id: `${curId}`,
        components: {
          initRender: { refName: "sphere" },
          metadata: {
            tags: [],
            name,
          },
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
        metadata: {
          tags: [],
          name: edge.name,
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
        refName: "text",
        text: n.name,
      },
      position: {
        x: points[i].position[0],
        y: points[i].position[1],
        z: points[i].position[2],
      },
      shader: {
        key: "wrapAroundPoint",
      },
      rotation: {
        amt: Math.PI,
        style: "angle axis",
        axis: 1,
      },
      calculateRotation: {
        calculation: (model: Model, entity: Entity) => {
          return -model.time / 60 + Number.parseFloat(entity.id);
        },
      },
      calculatePosition: [
        {
          calculation: (m: Model, e: EntityWith<"position">) => {
            const blah = m.entities.find((e) => e.id === `${nameToId[n.name]}`);
            if (!blah) throw new Error("fuck");
            return { ...blah.components.position };
          },
        },
        {
          calculation: (m: Model, e: EntityWith<"position">) => {
            const diff = [
              e.components.position.x - tm.camera.position.x,
              e.components.position.y - tm.camera.position.y,
              e.components.position.z - tm.camera.position.z,
            ];
            return { y: -0.5 };
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
  new THREEManager({
    enableOrbit: true,
    ortho: false,
    cameraPos: [50, 20, 40],
  })
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
  report: (model) => {
    console.log(tm.camera.position);
    return model;
  },
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
