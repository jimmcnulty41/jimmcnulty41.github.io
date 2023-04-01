import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { levitateSystem } from "./systems/levitateSystem.js";
import { calcPositionSystem, calcRotationSystem, calcScaleSystem, } from "./systems/calcTransformSystem.js";
import { ageSystem } from "./systems/ageSystem.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import { jumpOnSelectedSystem } from "./systems/jumpOnSelectedSystem.js";
import { THREEManager, getResolvedTHREEManager, } from "./systems/three_wrappers/THREEManager.js";
import { initTHREEObjectSystem } from "./systems/three_wrappers/initTHREEObjectSystem.js";
import { wanderTowardSystem } from "./systems/wanderTowardSystem.js";
import { getRandomImageName } from "./systems/three_wrappers/loadImages.js";
import { getMetadata } from "./data/data_9.js";
const disabledSystems = ["report"];
let model = {
    time: 0,
    input: defaultInputComponent,
    cameraRotation: 0,
    entities: [
        {
            id: "0",
            components: {
                metadata: { tags: [] },
                wanderToward: {
                    target: { x: 0, y: 0, z: 0 },
                    speed: 1,
                    friendliness: 1,
                    static: true,
                },
                initRender: {
                    refName: "sphere",
                },
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
            },
        },
        {
            id: "1",
            components: {
                metadata: { tags: ["cover"] },
                wanderToward: {
                    target: { x: -20, y: 0, z: -20 },
                    speed: 0.000001,
                    friendliness: 1,
                    static: true,
                },
                initRender: {
                    refName: "sphere",
                },
                position: {
                    x: -20,
                    y: 0,
                    z: -20,
                },
            },
        },
    ],
    idCounter: 2,
};
function newDefaultEntity(id) {
    const roll = Math.random();
    const roll2 = Math.random();
    const randomSpot = {
        x: Math.random() * 100 - 50,
        y: 0,
        z: Math.random() * 100 - 50,
    };
    const imageName = getRandomImageName();
    const m = getMetadata(imageName);
    return {
        id,
        components: {
            age: {},
            initRender: {
                refName: "sketchbook_page",
                pageName: imageName,
            },
            metadata: {
                tags: m.tags,
            },
            wanderToward: {
                target: randomSpot,
                speed: roll / 100,
                friendliness: roll / 2,
            },
            position: {
                x: 0,
                y: 0,
                z: 0,
            },
            rotation: {
                style: "angle axis",
                amt: 0,
                axis: 1,
            },
            scale: {
                amt: 1 - roll / 2,
            },
        },
    };
}
const blah = await getResolvedTHREEManager(new THREEManager({ enableOrbit: true }));
let systems = {
    advanceTimeSystem: (model) => ({
        ...model,
        time: model.time + 1,
    }),
    addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(newDefaultEntity, 5),
    jumpOnSelectedSystem,
    ageSystem,
    wanderSystem,
    levitateSystem,
    wanderTowardSystem,
    calcRotationSystem,
    calcScaleSystem,
    calcPositionSystem,
    initTHREEObject: (m) => initTHREEObjectSystem(blah, m),
    updateTHREEScene: (m) => updateTHREEScene(blah, m),
};
function RunECS() {
    console.log("Simulation begins");
    update();
}
async function update() {
    window.requestAnimationFrame(() => update());
    const sys = Object.keys(systems).filter((s) => !disabledSystems.includes(s));
    for (let i = 0; i < sys.length; ++i) {
        model = await systems[sys[i]](model);
    }
}
RunECS();
