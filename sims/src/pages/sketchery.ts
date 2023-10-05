import { addEntityEveryNTicksSystem } from "../systems/addEntityEveryNTicksSystem.js";
import { ageSystem } from "../systems/ageSystem.js";
import { defaultInputComponent } from "../components/InputComponent.js";
import { getSortByTagSystem } from "../systems/sortByTagSystem.js";
import { getTags } from "../data/data_9.js";
import { initTHREEObjectSystem } from "../systems/three_wrappers/initTHREEObjectSystem.js";
import { jumpOnSelectedSystem } from "../systems/jumpOnSelectedSystem.js";
import { levitateSystem } from "../systems/levitateSystem.js";
import { Model } from "../lib/Model.js";
import { sketchbook_page_in_spiral } from "../lib/entityLibrary.js";
import { updateTHREEScene } from "../systems/three_wrappers/updateTHREESceneSystem.js";
import { wanderSystem } from "../systems/wanderSystem.js";

import {
  calcPositionSystem,
  calcRotationSystem,
  calcScaleSystem,
} from "../systems/calcTransformSystem.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "../systems/three_wrappers/THREEManager.js";

const disabledSystems = ["report"];

let model: Model = {
  time: 0,
  input: defaultInputComponent,
  cameraRotation: 0,
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
        calculatePosition: [
          {
            calculation: (m, e) => {
              const t = m.time;
              const t2 = t - 20;
              if (t2 < 0) return { z: 0 };
              return { z: -t2 };
            },
          },
        ],
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
  achievements: [],
  toasts: [],
};

const tm = await getResolvedTHREEManager(
  new THREEManager({
    enableOrbit: false,
    cameraPos: [0, 115, -25],
    lookAt: [0, 0, -25],
  })
);

document.addEventListener("JIM_entityClick", (event) => {
  // @ts-ignore
  const blah: HTMLImageElement = (tm.scene.children[event.detail.id] as Mesh)
    .material.map.source.data;
  const yadda = getTags(blah.src);
  const imgV = document.createElement("image-viewer");
  imgV.setAttribute("src", blah.src);
  imgV.setAttribute("tags", yadda);
  document.querySelector("body")?.appendChild(imgV);
});

type System = (model: Model) => Model;
type Systems = { [name: string]: System };
let systems: Systems = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  sortByTagSystem: getSortByTagSystem(tm),
  jumpOnSelectedSystem,
  ageSystem,
  wanderSystem,
  levitateSystem,
  calcRotationSystem,
  calcScaleSystem,
  calcPositionSystem,
  //reportSystem,
  addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(
    sketchbook_page_in_spiral,
    1,
    0,
    256
  ),
  initTHREEObject: (m) => initTHREEObjectSystem(tm, m),
  updateTHREEScene: (m) => updateTHREEScene(tm, m),
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
