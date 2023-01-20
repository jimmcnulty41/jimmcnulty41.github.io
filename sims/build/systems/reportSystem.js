import { canWander } from "../components/Components.js";
export function reportSystem(model) {
    console.log(model.entities
        .filter(canWander)
        .map((x) => x.components.wander.internalRoll));
    return model;
}
