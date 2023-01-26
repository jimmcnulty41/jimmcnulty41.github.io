import { isCalcRotation } from "../components/Components.js";
export function calcRotationSystem(model) {
    return {
        ...model,
        entities: [
            ...model.entities.filter((e) => !isCalcRotation(e)),
            ...model.entities.filter(isCalcRotation).map((e) => {
                const { rotation, calculateRotation, ...unaffectedComponents } = e.components;
                rotation.amt = e.components.calculateRotation.calculation(model.time);
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
