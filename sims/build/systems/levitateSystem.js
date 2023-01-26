import { levitates } from "../components/Components.js";
function update(e, t) {
    const { x, y, z } = e.components.position;
    const l = e.components.levitate;
    return {
        ...e,
        components: {
            ...e.components,
            position: {
                x,
                y: Math.sin((t * l.speed) / 16 + l.roll) * 16,
                z,
            },
        },
    };
}
export function levitateSystem(model) {
    const entities = [
        ...model.entities.filter((e) => !levitates(e)),
        ...model.entities.filter(levitates).map((e) => update(e, model.time)),
    ];
    return {
        ...model,
        entities,
    };
}