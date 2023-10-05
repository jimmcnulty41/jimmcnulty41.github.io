import { Entity } from "../lib/Entity.js";
import { Model } from "../lib/Model.js";
import {
  EntityWith,
  isEntityWith,
  isEntityWithFn,
} from "../components/Components.js";

function selection(entity: Entity): entity is EntityWith<"color" | "scale"> {
  return isEntityWith(entity, "color") && isEntityWith(entity, "scale");
}
const defaultColor = {
  r: 1,
  g: 1,
  b: 1,
};

export function jumpOnSelectedSystem(model: Model): Model {
  return {
    ...model,
    entities: [
      ...model.entities.filter((e) => !selection(e)),
      ...model.entities
        .filter(selection)

        .map((e) => {
          const { scale, color, ...unaffectedComponents } = e.components;
          if (
            e.id !== model.input.entityUnderMouse &&
            e.id === model.input.prevEntityUnderMouse
          ) {
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
                amt: 2,
              },
            },
          };
        }),
    ],
  };
}
