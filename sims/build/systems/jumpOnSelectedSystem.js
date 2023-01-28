import { isEntityWith, isEntityWithFn } from "../components/Components.js";
export function jumpOnSelectedSystem(model) {
    return {
        ...model,
        entities: [
            ...model.entities.filter((e) => !isEntityWith(e, "position")),
            ...model.entities
                .filter(isEntityWithFn("position"))
                .map((e) => {
                if (e.id !== model.input.entityUnderMouse) {
                    return e;
                }
                const { position, ...unaffectedComponents } = e.components;
                return {
                    ...e,
                    components: {
                        ...unaffectedComponents,
                        position: {
                            ...position,
                            y: 100,
                        },
                    },
                };
            }),
        ],
    };
}
