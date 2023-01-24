import { updateTHREEScene } from "./systems/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { remap } from "./utils.js";
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
    idCounter: 0,
};
function newDefaultEntity(id) {
    const internalRoll = remap(0, 1, 0.1, 0.4)(Math.random());
    return {
        id,
        components: {
            render: { type: "3d model", refName: "rat" },
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
                            shouldTransition: (roll) => {
                                return roll < internalRoll / 12;
                            },
                        },
                        {
                            fromStateName: "turning",
                            toStateName: "forward",
                            shouldTransition: (roll) => {
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
let systems = {
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
