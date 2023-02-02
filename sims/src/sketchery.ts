import { Model } from "./Model.js";
import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { Entity } from "./Entity.js";
import { lerp, remap } from "./utils.js";
import { levitateSystem } from "./systems/levitateSystem.js";
import {
  calcPositionSystem,
  calcRotationSystem,
  calcScaleSystem,
} from "./systems/calcTransformSystem.js";
import { ageSystem } from "./systems/ageSystem.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import { jumpOnSelectedSystem } from "./systems/jumpOnSelectedSystem.js";
import { AgeComponent, getAge } from "./components/AgeComponent.js";
import { AngleAxisRotationComponent } from "./components/RotationComponent.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "./systems/three_wrappers/THREEManager.js";
import { initTHREEObjectSystem } from "./systems/three_wrappers/initTHREEObjectSystem.js";

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
        initRender: {
          refName: "head_top",
        },
        position: { x: 0, y: 0, z: 0 },
      },
    },
    {
      id: "0",
      components: {
        initRender: {
          refName: "head_bottom",
        },
        position: { x: 0, y: 0, z: 0 },
      },
    },
  ],
  idCounter: 2,
};

function newDefaultEntity(id: string): Entity {
  const internalRoll = Math.random();
  const internalRoll2 = Math.random();
  const internalRoll3 = Math.random();

  const target1 = {
    x: remap(0, 1, -50, 50)(internalRoll),
    y: internalRoll3 * 4,
    z: remap(0, 1, 0, -50)(internalRoll2),
  };
  const target2 = {
    ...target1,
    x: 0,
  };
  return {
    id,
    components: {
      color: { r: 1, g: 1, b: 1 },
      age: {},
      initRender: {
        refName: "plane",
      },
      position: {
        x: 0,
        y: internalRoll3 * 4,
        z: 0,
      },
      rotation: {
        style: "angle axis",
        amt: 0,
        axis: 1,
      },
      scale: {
        amt: 0,
      },
      calculateScale: {
        calculation: (m, e) => {
          const t = e.components.age
            ? getAge(m.time, e.components.age)
            : m.time;
          return remap(0, 100, 0, 1, true)(t);
        },
      },
      calculateRotation: {
        calculation: (m, e) => {
          const t =
            m.input.entityUnderMouse === e.id ? m.time / 2 : m.time / 12;
          return (
            (e.components.rotation as AngleAxisRotationComponent).amt +
            Math.sin(t + internalRoll * 100) / 100
          );
        },
      },
      calculatePosition: {
        calculation: (m, e) => {
          const t = remap(
            0,
            50,
            0,
            1,
            true
          )(getAge(m.time, e.components.age as AgeComponent));
          const target = {
            x: lerp(target2.x, target1.x, t),
            y: m.input.entityUnderMouse === e.id ? target1.y + 5 : target1.y,
            z: target1.z,
          };
          return {
            x: lerp(e.components.position.x, target.x, t),
            y: lerp(e.components.position.y, target.y, t),
            z: lerp(e.components.position.z, target.z, t),
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
  initTHREEObject: (m) => initTHREEObjectSystem(blah, m),
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
