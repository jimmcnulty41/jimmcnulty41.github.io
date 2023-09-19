import { Achievement, Model, Toast } from "./Model.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import { Entity } from "./Entity.js";
import { initTHREEObjectSystem } from "./systems/three_wrappers/initTHREEObjectSystem.js";
import { remap, splitArray } from "./utils.js";
import { reportSystem } from "./systems/reportSystem.js";
import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import {
  THREEManager,
  getResolvedTHREEManager,
} from "./systems/three_wrappers/THREEManager.js";
import { PositionComponent } from "./components/PositionComponent.js";

const disabledSystems = ["report"];

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
  idCounter: 0,
  input: defaultInputComponent,
  cameraRotation: 0,
  achievements: [],
  toasts: [],
};

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
  new THREEManager({ enableOrbit: true, cameraPos: [100, 100, 100] })
);

function getDist(es: Entity[]) {
  const positions = es
    .map((e) => e.components.position)
    .filter((x): x is PositionComponent => x !== undefined)
    .flatMap((p) => [p.x, p.y, p.z]);
  return Math.max(...positions) - Math.min(...positions);
}

const achievements: Achievement[] = [
  (es: Entity[]) =>
    es.filter((e) => e.components.position).length > 10 ? "Cute rat pets!" : "",
  (es: Entity[]) =>
    es.filter((e) => e.components.position).length > 400
      ? "Now that's a rat colony!"
      : "",
  (es: Entity[]) =>
    getDist(es) > 200 ? "Your rats have begun to leave the nest" : "",
  (es: Entity[]) =>
    getDist(es) > 600
      ? "The fastest rats have pushed the boundaries of ratdom outward"
      : "",
  (es: Entity[]) =>
    getDist(es) > 1000 ? "The extent of the rat world knows no bounds!" : "",
  (es: Entity[]) =>
    getDist(es) > 2000
      ? "Some great rat adventurers have discovered distant lands!"
      : "",
  (es: Entity[]) =>
    es.filter((e) => e.components.position).length > 999
      ? "Oh wow, you've got a whole civilization!"
      : "",
];

const toastDuration = 1000;
function achievementSystem(model: Model): Model {
  const earnedAchievements = achievements
    .map((achieveFn) => achieveFn(model.entities))
    .filter((x) => x);

  const diff = earnedAchievements.filter(
    (e) => !model.achievements.some((alreadyEarned) => alreadyEarned === e)
  );

  const toasts = diff.length
    ? [
        ...model.toasts,
        ...diff.map((newAchievement) => ({
          expirationTime: model.time + toastDuration,
          message: newAchievement,
          needsInit: true,
        })),
      ]
    : model.toasts;

  return {
    ...model,
    toasts,
    achievements: earnedAchievements,
  };
}

function needsInit(t: Toast): t is Toast {
  return t.needsInit;
}

let toastSegmentAdded = false;
function getToastContainer(): HTMLDivElement {
  if (toastSegmentAdded) {
    const blah = document.querySelector("#toasts");
    if (!blah) {
      throw new Error("lied about adding toast segment");
    }
    return blah as HTMLDivElement;
  } else {
    const el = document.createElement("div");
    el.id = "toasts";
    document.querySelector("body")?.append(el);
    toastSegmentAdded = true;
    return el;
  }
}

function toastSystem(model: Model): Model {
  const { matching: newToasts, notMatching: existingToasts } = splitArray(
    model.toasts,
    needsInit
  );
  const { matching: expiredToasts, notMatching: aliveToasts } = splitArray(
    existingToasts,
    (e): e is Toast => e.expirationTime < model.time
  );

  newToasts.forEach((t) => {
    const toast = document.createElement("div");
    toast.id = t.message.replaceAll(/\W/g, "");
    const icon = document.createElement("i");
    icon.classList.add("fa-solid");
    icon.classList.add("fa-trophy");
    toast.append(icon);
    const p = document.createElement("p");
    p.innerText = t.message;
    toast.append(p);
    getToastContainer().append(toast);
  });
  expiredToasts.forEach((t) => {
    document.querySelector(`#${t.message.replaceAll(/\W/g, "")}`)?.remove();
  });

  return {
    ...model,
    toasts: [
      ...aliveToasts,
      ...newToasts.map((t) => ({ ...t, needsInit: false })),
    ],
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
  achievementSystem,
  //reportSystem,
  initTHREEScene: (m) => initTHREEObjectSystem(tm, m),
  updateTHREEScene: (m) => updateTHREEScene(tm, m),
  toastSystem,
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
