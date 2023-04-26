import { updateTHREEScene } from "./systems/three_wrappers/updateTHREESceneSystem.js";
import { wanderSystem } from "./systems/wanderSystem.js";
import { addEntityEveryNTicksSystem } from "./systems/addEntityEveryNTicksSystem.js";
import { remap } from "./utils.js";
import { defaultInputComponent } from "./components/InputComponent.js";
import { THREEManager, getResolvedTHREEManager, } from "./systems/three_wrappers/THREEManager.js";
import { initTHREEObjectSystem } from "./systems/three_wrappers/initTHREEObjectSystem.js";
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
    input: defaultInputComponent,
    cameraRotation: 0,
};
function newDefaultEntity(id) {
    const internalRoll = remap(0, 1, 0.1, 0.4)(Math.random());
    const internalRoll2 = Math.random();
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
                x: 0,
                y: internalRoll2 * 10,
                z: (internalRoll * 10) % 10,
            },
        },
    };
}
const tm = await getResolvedTHREEManager(new THREEManager({
    enableOrbit: false,
    ortho: true,
    cameraPos: [10, 10, 0],
}));
let systems = {
    advanceTimeSystem: (model) => ({
        ...model,
        time: model.time + 1,
    }),
    addEntityEveryNTicksSystem: addEntityEveryNTicksSystem(newDefaultEntity, 1),
    wanderSystem,
    //reportSystem,
    initTHREEScene: (m) => initTHREEObjectSystem(tm, m),
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
