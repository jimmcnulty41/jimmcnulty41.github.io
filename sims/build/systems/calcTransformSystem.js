import { isCalcPosition, isCalcRotation, isCalcScale, } from "../components/Components.js";
function getT(modelTime, age) {
    const hbd = age?.birthday !== undefined ? age.birthday : 0;
    return modelTime - hbd;
}
export function calcRotationSystem(model) {
    return {
        ...model,
        entities: [
            ...model.entities.filter((e) => !isCalcRotation(e)),
            ...model.entities.filter(isCalcRotation).map((e) => {
                const { rotation, calculateRotation, ...unaffectedComponents } = e.components;
                rotation.amt = calculateRotation.calculation(getT(model.time, e.components.age));
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
            ...model.entities.filter((e) => !isCalcScale(e)),
            ...model.entities.filter(isCalcScale).map((e) => {
                const { scale, calculateScale, ...unaffectedComponents } = e.components;
                scale.amt = calculateScale.calculation(getT(model.time, e.components.age));
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
            ...model.entities.filter((e) => !isCalcPosition(e)),
            ...model.entities.filter(isCalcPosition).map((e) => {
                const { position, calculatePosition, ...unaffectedComponents } = e.components;
                const { x, y, z } = calculatePosition.calculation(getT(model.time, e.components.age));
                const pos = {
                    x: x === undefined ? position.x : x,
                    y: y === undefined ? position.y : y,
                    z: z === undefined ? position.z : z,
                };
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
