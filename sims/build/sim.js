import { updateTHREEScene } from "./systems/updateTHREESceneSystem.js";
import { reportSystem } from "./systems/reportSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
function remap(min, max, newMin, newMax) {
    return (input) => newMin + ((input - min) / (max - min)) * (newMax - newMin);
}
const disabledSystems = ["report"];
let model = {
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
function newDefaultEntity(id) {
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
let systems = {
    advanceTimeSystem: (model) => (Object.assign(Object.assign({}, model), { time: model.time + 1 })),
    addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(newDefaultEntity, 10),
    wanderSystem,
    updateTHREEScene,
    reportSystem,
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
