import { splitArray } from "../../utils.js";
import { meshInitFuncs } from "./loadMeshes.js";
import { instanceIdToEntityId, registers, sceneIdToEntityId, updateColorRegister, updateMatrixRegister, } from "./threeOptimizations.js";
export function initTHREEObjectSystem(tm, model) {
    const { matching, notMatching } = splitArray(model.entities, (e) => e.components.initRender !== undefined);
    return {
        ...model,
        entities: [
            ...notMatching,
            ...matching.map((e) => {
                const { initRender, ...unaffected } = e.components;
                return {
                    ...e,
                    components: {
                        ...unaffected,
                        render: something[initRender.refName] === "instanced"
                            ? addObjectToTHREESceneFromInstance(tm, e)
                            : addObjectToTHREEScene(tm, e),
                    },
                };
            }),
        ],
    };
}
function addObjectToTHREESceneFromInstance(tm, entity) {
    const { refName } = entity.components.initRender;
    const { inst, idCounter } = tm.instanceMeshes[entity.components.initRender.refName];
    updateColorRegister(entity.components);
    inst.setColorAt(idCounter, registers.color);
    updateMatrixRegister(entity.components);
    inst.setMatrixAt(idCounter, registers.matrix);
    const id = idCounter;
    instanceIdToEntityId[refName][`${id}`] = entity.id;
    const newCount = idCounter + 1;
    tm.instanceMeshes[refName].idCounter = newCount;
    tm.instanceMeshes[refName].inst.count = newCount;
    return {
        type: "instanced",
        refName,
        id,
    };
}
const something = {
    rat: "instanced",
};
function addObjectToTHREEScene(tm, e) {
    const { refName } = e.components.initRender;
    const meshFn = meshInitFuncs[refName];
    if (!meshFn) {
        throw new Error("unknown refname");
    }
    const o = meshFn(tm);
    tm.scene.add(o);
    const idx = tm.scene.children.findIndex((c) => c.id === o.id);
    sceneIdToEntityId[o.id] = e.id;
    return {
        type: "standard",
        refName,
        id: idx,
    };
}
