import { updateTHREEScene } from "./systems/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { remap } from "./utils.js";
import { levitateSystem } from "./systems/levitateSystem.js";
import { calcPositionSystem, calcRotationSystem, calcScaleSystem, } from "./systems/calcTransformSystem.js";
import { ageSystem } from "./systems/ageSystem.js";
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
        {
            id: "1",
            components: {
                rotation: {
                    style: "angle axis",
                    axis: 1,
                    amt: 0,
                },
                calculatePosition: {
                    calculation: (t) => {
                        const t2 = t - 100;
                        if (t2 < 0)
                            return { z: 0 };
                        return { z: -t2 };
                    },
                },
                render: {
                    type: "3d model",
                    refName: "head_top",
                    objectName: "head_top",
                },
                position: { x: 0, y: 0, z: 0 },
            },
        },
        {
            id: "0",
            components: {
                render: {
                    type: "3d model",
                    refName: "head_top",
                    objectName: "head_bottom",
                },
                position: { x: 0, y: 0, z: 0 },
            },
        },
    ],
    idCounter: 2,
};
function newDefaultEntity(id) {
    const internalRoll = Math.random();
    const sign = Math.sign(remap(0, 1, -1, 1)(internalRoll));
    const pow = remap(0, 1, 0, 0.1)(internalRoll);
    const sizeFn = remap(0, 50, 0, 1, true);
    return {
        id,
        components: {
            age: {},
            render: {
                type: "instanced 3d model",
                refName: "plane",
            },
            position: {
                x: 0,
                y: 0,
                z: 0,
            },
            rotation: {
                style: "standard",
                dix: 0,
            },
            scale: {
                amt: 0,
            },
            calculateScale: {
                calculation: (t) => sizeFn(t),
            },
            calculatePosition: {
                calculation: (t) => {
                    const t2 = remap(0, 100, 0, 100, true)(t);
                    return {
                        x: (sign * Math.pow(t2, 2) * pow) / 10,
                        z: -t2 / 2,
                    };
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
    ageSystem,
    wanderSystem,
    levitateSystem,
    calcRotationSystem,
    calcScaleSystem,
    calcPositionSystem,
    //reportSystem,
    addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(newDefaultEntity, 10, 100),
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
