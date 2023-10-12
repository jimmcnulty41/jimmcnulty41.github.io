import { isEntityWith, } from "../components/Components.js";
function selection(entity) {
    return isEntityWith(entity, "color") && isEntityWith(entity, "scale");
}
const defaultColor = {
    r: 1,
    g: 1,
    b: 1,
};
export function jumpOnSelectedSystem(model) {
    return {
        ...model,
        entities: [
            ...model.entities.filter((e) => !selection(e)),
            ...model.entities
                .filter(selection)
                .map((e) => {
                const { scale, color, ...unaffectedComponents } = e.components;
                if (e.id !== model.input.entityUnderMouse &&
                    e.id === model.input.prevEntityUnderMouse) {
                    return {
                        ...e,
                        components: {
                            ...unaffectedComponents,
                            color: defaultColor,
                            scale: {
                                amt: 1,
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
                        color: {
                            r: 1,
                            g: 0,
                            b: 0,
                        },
                        scale: {
                            amt: 4,
                        },
                    },
                };
            }),
        ],
    };
}
