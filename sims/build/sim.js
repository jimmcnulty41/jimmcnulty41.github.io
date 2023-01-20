import { updateTHREEScene } from "./systems/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
const disabledSystems = ["report"];
let model = {
    time: 0,
    entities: [
        {
            id: "0",
            components: {
                render: {
                    type: "grid",
                },
                position: { x: 0, y: 0, z: 0 },
            },
        },
    ],
    idCounter: 1,
};
function newDefaultEntity(id) {
    const internalRoll = Math.random();
    return {
        id,
        components: {
            render: { type: "sphere" },
            position: { x: 0, y: 0, z: 0 },
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
                                return roll < internalRoll;
                            },
                        },
                        {
                            fromStateName: "turning",
                            toStateName: "forward",
                            shouldTransition: (roll) => {
                                return roll < 1 - internalRoll;
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
