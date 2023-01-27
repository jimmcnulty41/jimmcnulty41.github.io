import { isEntityWith, isEntityWithFn, } from "../components/Components.js";
export function ageSystem(model) {
    const entities = [
        ...model.entities.filter((e) => !isEntityWith(e, "age")),
        ...model.entities
            .filter(isEntityWithFn("age"))
            .map((e) => {
            const { age, ...unaffectedComponents } = e.components;
            if (age.birthday === undefined) {
                return {
                    ...e,
                    components: {
                        ...unaffectedComponents,
                        age: {
                            birthday: model.time,
                        },
                    },
                };
            }
            return e;
        }),
    ];
    return {
        ...model,
        entities,
    };
}
