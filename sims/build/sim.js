var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as THREE from "./vendor/three.js";
import { OrbitControls } from "./vendor/OrbitControls.js";
let scene = new THREE.Scene();
const canvas = document.querySelector("canvas");
if (!canvas)
    throw new Error("canvas not found on page");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);
const orbitControls = new OrbitControls(camera, canvas);
function updateStateMachine(machine, roll) {
    const transition = machine.edges.find((t) => t.fromStateName === machine.current && t.shouldTransition(roll));
    if (!transition) {
        return machine;
    }
    return Object.assign(Object.assign({}, machine), { current: transition.toStateName });
}
function start() {
    console.log("Simulation begins");
    update();
}
function remap(min, max, newMin, newMax) {
    return (input) => newMin + ((input - min) / (max - min)) * (newMax - newMin);
}
function getGrid() {
    return new THREE.GridHelper(100, 10, 0xff0000);
}
function createObject({ type }) {
    switch (type) {
        case "sphere":
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            return mesh;
        case "grid":
            return getGrid();
    }
}
const dirs = [
    [0, 0, 1],
    [0, 0, -1],
    [1, 0, 0],
    [-1, 0, 0],
];
function isRenderable(entity) {
    return (entity.components.render !== undefined &&
        entity.components.position !== undefined);
}
function canWander(entity) {
    return (entity.components.wander !== undefined &&
        entity.components.position !== undefined);
}
function isPositioned(entity) {
    return entity.components.position !== undefined;
}
const disabledSystems = ["report"];
let systems = {
    advanceTimeSystem: (model) => (Object.assign(Object.assign({}, model), { time: model.time + 1 })),
    addEntityEveryNTicks: (model) => model.time % 3 || model.entities.length > 100
        ? model
        : Object.assign(Object.assign({}, model), { entities: [...model.entities, newDefaultEntity(`${model.idCounter}`)], idCounter: model.idCounter + 1 }),
    wander: (model) => {
        function entityWander(e, i) {
            let _a = e.components, { position, wander } = _a, unaffectedComponents = __rest(_a, ["position", "wander"]);
            const dix = wander.directionIndex;
            if (wander.fsm.current === "forward") {
                position = {
                    x: position.x + wander.speed * dirs[dix][0],
                    y: position.y + wander.speed * dirs[dix][1],
                    z: position.z + wander.speed * dirs[dix][2],
                };
            }
            else if (wander.fsm.current === "turning") {
                wander = Object.assign(Object.assign({}, wander), { directionIndex: (dix + 1) % dirs.length });
            }
            wander.fsm = updateStateMachine(e.components.wander.fsm, Math.random());
            return Object.assign(Object.assign({}, e), { components: Object.assign(Object.assign({}, unaffectedComponents), { position,
                    wander }) });
        }
        return Object.assign(Object.assign({}, model), { entities: [
                ...model.entities.filter(canWander).map(entityWander),
                ...model.entities.filter((x) => !canWander(x)),
            ] });
    },
    report: (model) => {
        const positions = model.entities
            .filter(isPositioned)
            .map((e) => e.components.position);
        const posSum = positions.reduce((sum, p) => ({
            x: sum.x + p.x,
            y: sum.y + p.y,
            z: sum.z + p.z,
        }), { x: 0, y: 0, z: 0 });
        console.log(`${(posSum.x / positions.length).toFixed(2)} ${(posSum.y / positions.length).toFixed(2)} ${(posSum.z / positions.length).toFixed(2)}`);
        return model;
    },
    updateTHREEScene: (model) => {
        const sceneMapping = Object.assign({}, model.sceneMapping);
        model.entities.filter(isRenderable).forEach((e) => {
            if (!isRenderable(e)) {
                return;
            }
            if (!sceneMapping[e.id]) {
                // instance in scene
                const object = createObject(e.components.render);
                scene.add(object);
                sceneMapping[e.id] = object.id;
            }
            else {
                const childIdx = scene.children.findIndex((c) => c.id === sceneMapping[e.id]);
                scene.children[childIdx].position.set(e.components.position.x, e.components.position.y, e.components.position.z);
            }
        });
        orbitControls.update();
        return Object.assign(Object.assign({}, model), { sceneMapping });
    },
};
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
function update() {
    window.requestAnimationFrame(() => update());
    Object.keys(systems)
        .filter((s) => !disabledSystems.includes(s))
        .forEach((s) => {
        model = systems[s](model);
    });
    renderer.render(scene, camera);
}
start();
