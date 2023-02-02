import { hasRotation, isEntityWith, } from "../../components/Components.js";
import { inputSystem } from "./inputSystem.js";
import { registers, updateColorRegister, updateMatrixRegister, } from "./threeOptimizations.js";
import { splitArray } from "../../utils.js";
function instancedUpdate(tm, entity) {
    const { id, refName } = entity.components.render;
    const { inst } = tm.instanceMeshes[refName];
    updateColorRegister(entity.components);
    inst.setColorAt(id, registers.color);
    updateMatrixRegister(entity.components);
    inst.setMatrixAt(id, registers.matrix);
}
function standardUpdate(tm, entity) {
    const childIdx = entity.components.render.id;
    if (isEntityWith(entity, "scale")) {
        const { amt } = entity.components.scale;
        if (typeof amt === "number") {
            tm.scene.children[childIdx].scale.set(amt, amt, amt);
        }
        else {
            tm.scene.children[childIdx].scale.set(amt[0], amt[1], amt[2]);
        }
    }
    if (hasRotation(entity)) {
        updateMatrixRegister({ rotation: entity.components.rotation });
        tm.scene.children[childIdx].setRotationFromMatrix(registers.matrix);
    }
    tm.scene.children[childIdx].position.set(entity.components.position.x, entity.components.position.y, entity.components.position.z);
}
export function updateTHREEScene(tm, model) {
    const { matching: renderable, notMatching: notRenderable } = splitArray(model.entities, (e) => isEntityWith(e, "position") && isEntityWith(e, "render"));
    renderable.forEach((e) => {
        switch (e.components.render.type) {
            case "instanced":
                instancedUpdate(tm, e);
                return;
            case "standard":
                standardUpdate(tm, e);
                return;
        }
    });
    Object.keys(tm.instanceMeshes).forEach((k) => {
        setInstUpdate(tm.instanceMeshes[k].inst);
    });
    tm.orbitControls.update();
    tm.renderer.render(tm.scene, tm.camera);
    return inputSystem(tm, model);
}
function setInstUpdate(inst) {
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) {
        inst.instanceColor.needsUpdate = true;
    }
}
