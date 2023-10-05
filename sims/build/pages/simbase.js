import { defaultInputComponent } from "../components/InputComponent.js";
import { initTHREEObjectSystem } from "../systems/three_wrappers/initTHREEObjectSystem.js";
import { updateTHREEScene } from "../systems/three_wrappers/updateTHREESceneSystem.js";
import { THREEManager, getResolvedTHREEManager, } from "../systems/three_wrappers/THREEManager.js";
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
    toasts: [],
    achievements: [],
};
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
    Object.keys(systems).forEach((s) => {
        model = systems[s](model);
    });
}
RunECS();
