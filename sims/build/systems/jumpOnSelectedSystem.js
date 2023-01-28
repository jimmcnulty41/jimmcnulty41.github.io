import { isEntityWith, isEntityWithFn } from "../components/Components.js";
export function jumpOnSelectedSystem(model) {
    return {
        ...model,
        entities: [
            ...model.entities.filter((e) => !isEntityWith(e, "position")),
            ...model.entities
                .filter(isEntityWithFn("position"))
                .map((e) => {
                const { position, ...unaffectedComponents } = e.components;
                if (e.id !== model.input.entityUnderMouse &&
                    e.id === model.input.prevEntityUnderMouse) {
                    return {
                        ...e,
                        components: {
                            ...unaffectedComponents,
                            position: {
                                ...position,
                                y: 0,
                            },
                        },
                    };
                }
                if (e.id !== model.input.entityUnderMouse) {
                    return e;
                }
                return {
                    ...e,
                    components: {
                        ...unaffectedComponents,
                        position: {
                            ...position,
                            y: 10,
                        },
                    },
                };
            }),
        ],
    };
}
