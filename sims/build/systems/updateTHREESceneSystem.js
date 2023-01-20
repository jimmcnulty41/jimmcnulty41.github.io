import * as THREE from "../vendor/three.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { isRenderable } from "../components/Components.js";
let entityIdToSceneChild = {};
let entityIdToInstanceId = {};
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
const geometry = new THREE.IcosahedronGeometry(0.5, 3);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
const instancedMesh = new THREE.InstancedMesh(geometry, material, 100);
instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
scene.add(instancedMesh);
let instanceId = 0;
const matrix_reg = new THREE.Matrix4();
function updateSphere(sphereEntity) {
    const id = entityIdToInstanceId[sphereEntity.id];
    matrix_reg.identity();
    if (id === undefined) {
        matrix_reg.setPosition(0, 0, 0);
        entityIdToInstanceId[sphereEntity.id] = instanceId;
        instancedMesh.setMatrixAt(instanceId++, matrix_reg);
    }
    else {
        const { x, y, z } = sphereEntity.components.position;
        matrix_reg.setPosition(x, y, z);
        instancedMesh.setMatrixAt(id, matrix_reg);
    }
}
function updateGrid(gridEntity) {
    const id = entityIdToSceneChild[gridEntity.id];
    if (id === undefined) {
        const grid = new THREE.GridHelper(100, 10, 0xff0000);
        scene.add(grid);
        entityIdToSceneChild[gridEntity.id] = grid.id;
    }
    else {
        const childIdx = scene.children.findIndex((c) => c.id === entityIdToSceneChild[gridEntity.id]);
        scene.children[childIdx].position.set(gridEntity.components.position.x, gridEntity.components.position.y, gridEntity.components.position.z);
    }
}
export function updateTHREEScene(model) {
    const renderables = model.entities.filter(isRenderable);
    renderables
        .filter((e) => e.components.render.type === "sphere")
        .forEach(updateSphere);
    instancedMesh.instanceMatrix.needsUpdate = true;
    renderables
        .filter((e) => e.components.render.type === "grid")
        .forEach(updateGrid);
    orbitControls.update();
    renderer.render(scene, camera);
    return Object.assign({}, model);
}
