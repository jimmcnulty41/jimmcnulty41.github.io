import { isEntityWith, isEntityWithFn } from "../components/Components.js";
export function colorSystem(model) {
    const entities = [
        ...model.entities.filter((e) => !isEntityWith(e, "color")),
        ...model.entities.filter(isEntityWithFn("color")),
    ];
}
