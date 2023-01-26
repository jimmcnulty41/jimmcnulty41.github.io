import { Model } from "../Model.js";
import { isEntityWithAge } from "../components/Components.js";

export function ageSystem(model: Model): Model {
  const entities = [
    ...model.entities.filter((e) => !isEntityWithAge(e)),
    ...model.entities.filter(isEntityWithAge).map((e) => {
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
