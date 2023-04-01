import { getAge } from "../components/AgeComponent.js";
import { lerp, remap, splitArray } from "../utils.js";
import { hasCalculatedPosition, hasCalculatedRotation, hasCalculatedScale, } from "../components/Components.js";
export function calcRotationSystem(model) {
    const { matching, notMatching } = splitArray(model.entities, hasCalculatedRotation);
    return {
        ...model,
        entities: [
            ...notMatching,
            ...matching.map((e) => {
                const { rotation, calculateRotation, ...unaffectedComponents } = e.components;
                rotation.amt = calculateRotation.calculation(model, e);
                return {
                    ...e,
                    components: {
                        ...unaffectedComponents,
                        calculateRotation,
                        rotation,
                    },
                };
            }),
        ],
    };
}
export function calcScaleSystem(model) {
    return {
        ...model,
        entities: [
            ...model.entities.filter((e) => !hasCalculatedScale(e)),
            ...model.entities.filter(hasCalculatedScale).map((e) => {
                const { scale, calculateScale, ...unaffectedComponents } = e.components;
                scale.amt = calculateScale.calculation(model, e);
                return {
                    ...e,
                    components: {
                        ...unaffectedComponents,
                        calculateScale,
                        scale,
                    },
                };
            }),
        ],
    };
}
export function calcPositionSystem(model) {
    return {
        ...model,
        entities: [
            ...model.entities.filter((e) => !hasCalculatedPosition(e)),
            ...model.entities.filter(hasCalculatedPosition).map((e) => {
                const { position, calculatePosition, ...unaffectedComponents } = e.components;
                const pos = calculatePosition.reduce((pos, c) => {
                    const { x, y, z } = c.calculation(model, e);
                    return {
                        x: x === undefined ? pos.x : pos.x + x,
                        y: y === undefined ? pos.y : pos.y + y,
                        z: z === undefined ? pos.z : pos.z + z,
                    };
                }, { x: 0, y: 0, z: 0 });
                return {
                    ...e,
                    components: {
                        ...unaffectedComponents,
                        calculatePosition,
                        position: pos,
                    },
                };
            }),
        ],
    };
}
export function getLerpToPosComponent(pos) {
    return {
        calculation: (m, e) => {
            const t = remap(0, 50, 0, 1, true)(getAge(m.time, e.components.age));
            return {
                x: lerp(e.components.position.x, pos.x, t),
                y: lerp(e.components.position.y, pos.y, t),
                z: lerp(e.components.position.z, pos.z, t),
            };
        },
    };
}
