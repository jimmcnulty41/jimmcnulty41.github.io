import { newDefaultEntity } from "./sim.js";
export function addEntityEveryNTicks(model) {
    return model.time % 3 || model.entities.length > 100
        ? model
        : Object.assign(Object.assign({}, model), { entities: [...model.entities, newDefaultEntity(`${model.idCounter}`)], idCounter: model.idCounter + 1 });
}
