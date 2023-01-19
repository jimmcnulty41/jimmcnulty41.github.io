import { isPositioned } from "../sim.js";
export function reportSystem(model) {
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
}
