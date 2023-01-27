import { GridHelper, Matrix4, PerspectiveCamera, Scene, WebGLRenderer, Euler, HemisphereLight, sRGBEncoding, Vector3, } from "../vendor/three.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { hasRotation, isEntityWith, isRenderable, isRenderableGrid, isRenderableInstanceModel, isRenderableModel, isRenderableSphere, } from "../components/Components.js";
import { rots } from "../components/RotationComponent.js";
import { getInstanceMeshes, getSubmodel } from "./loadModels.js";
import { init, inputSystem } from "./inputSystem.js";
const eulers = rots.map((r) => new Euler(r[0], r[1], r[2]));
let entityIdToSceneChild = {};
let entityIdToInstanceId = {};
let instanceIdToEntityId = {};
let scene = new Scene();
const canvas = document.querySelector("canvas");
if (!canvas)
    throw new Error("canvas not found on page");
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = sRGBEncoding;
const camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 100, 1);
camera.lookAt(0, 0, 0);
const orbitControls = new OrbitControls(camera, canvas);
const registers = {
    matrix: new Matrix4(),
    euler: new Euler(),
    vector: new Vector3(),
};
const instanceMeshes = await getInstanceMeshes();
scene.add(new HemisphereLight(0xffffff, 0xff0033, 1));
Object.keys(instanceMeshes).forEach((k) => {
    scene.add(instanceMeshes[k].inst);
});
init(camera, instanceMeshes.plane.inst);
function updateSphere(sphereEntity) {
    return instancedUpdate(sphereEntity, "sphere");
}
function updateBasicRotation(rotation, childIdx) {
    const { style } = rotation;
    if (style === "standard") {
        const { dix } = rotation;
        scene.children[childIdx].setRotationFromEuler(eulers[dix]);
    }
    else {
        const { axis, amt } = rotation;
        const euler = new Euler(axis === 0 ? amt : 0, axis === 1 ? amt : 0, axis === 2 ? amt : 0);
        scene.children[childIdx].setRotationFromEuler(euler);
    }
}
function updateInstanceRotation(rotation) {
    const { style } = rotation;
    if (style === "angle axis") {
        const { axis, amt } = rotation;
        registers.euler.set(axis === 0 ? amt : 0, axis === 1 ? amt : 0, axis === 2 ? amt : 0);
        registers.matrix.makeRotationFromEuler(registers.euler);
    }
    else {
        registers.matrix.makeRotationFromEuler(eulers[rotation.dix]);
    }
}
function updateInstanceTransform(components) {
    const { matrix, vector } = registers;
    matrix.identity();
    matrix.setPosition(0, 0, 0);
    if (components.rotation) {
        updateInstanceRotation(components.rotation);
    }
    if (components.scale) {
        const { amt } = components.scale;
        if (typeof amt === "number") {
            vector.set(amt, amt, amt);
        }
        else {
            vector.set(amt[0], amt[1], amt[2]);
        }
        matrix.scale(vector);
    }
    if (components.position) {
        const { x, y, z } = components.position;
        matrix.setPosition(x, y, z);
    }
}
function instancedUpdate(entity, instanceKey) {
    const id = entityIdToInstanceId[entity.id];
    const { inst, idCounter } = instanceMeshes[instanceKey];
    if (id === undefined) {
        updateInstanceTransform(entity.components);
        inst.setMatrixAt(idCounter, registers.matrix);
        const newCount = idCounter + 1;
        entityIdToInstanceId[entity.id] = idCounter;
        instanceIdToEntityId[idCounter] = entity.id;
        instanceMeshes[instanceKey].idCounter = newCount;
        instanceMeshes[instanceKey].inst.count = newCount;
    }
    else {
        updateInstanceTransform(entity.components);
        inst.setMatrixAt(id, registers.matrix);
    }
}
function update3DModel(value) {
    return instancedUpdate(value, value.components.render.refName);
}
function updateSubmodel(value) {
    const { refName, objectName } = value.components.render;
    return basicUpdate(value, () => {
        return getSubmodel(refName, objectName);
    });
}
function basicUpdate(entity, createObjFn) {
    const id = entityIdToSceneChild[entity.id];
    if (id === undefined) {
        const o = createObjFn();
        scene.add(o);
        entityIdToSceneChild[entity.id] = o.id;
    }
    else {
        // there's an off-by-one-frame error here and instancedUpdate, if we separate the
        // else condition into a fn and call that fn in the creation case as well,
        // it should fix it
        const childIdx = scene.children.findIndex((c) => c.id === entityIdToSceneChild[entity.id]);
        if (isEntityWith(entity, "scale")) {
            const { amt } = entity.components.scale;
            if (typeof amt === "number") {
                scene.children[childIdx].scale.set(amt, amt, amt);
            }
            else {
                scene.children[childIdx].scale.set(amt[0], amt[1], amt[2]);
            }
        }
        if (hasRotation(entity)) {
            updateBasicRotation(entity.components.rotation, childIdx);
        }
        scene.children[childIdx].position.set(entity.components.position.x, entity.components.position.y, entity.components.position.z);
    }
}
function updateGrid(gridEntity) {
    basicUpdate(gridEntity, () => new GridHelper(100, 10, 0xff0000));
}
export function updateTHREEScene(model) {
    const renderables = model.entities.filter(isRenderable);
    renderables.filter(isRenderableSphere).forEach(updateSphere);
    renderables.filter(isRenderableGrid).forEach(updateGrid);
    renderables.filter(isRenderableInstanceModel).forEach(update3DModel);
    renderables.filter(isRenderableModel).forEach(updateSubmodel);
    Object.keys(instanceMeshes).forEach((k) => {
        setInstUpdate(instanceMeshes[k].inst);
    });
    orbitControls.update();
    renderer.render(scene, camera);
    return inputSystem(model);
}
function setInstUpdate(inst) {
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) {
        inst.instanceColor.needsUpdate = true;
    }
}
