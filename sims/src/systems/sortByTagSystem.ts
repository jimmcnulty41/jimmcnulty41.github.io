import { Entity } from "../Entity.js";
import { Model } from "../Model.js";
import { CalcPositionComponent } from "../components/CalcTransformComponents.js";
import { EntityWith, isEntityWith } from "../components/Components.js";
import { spiral, splitArray } from "../utils.js";
import { getLerpToPosComponent } from "./calcTransformSystem.js";

let tag = "";
let changed = false;

window.addEventListener("tagSelect", (e) => {
  tag = (e as CustomEvent).detail || "";
  changed = true;
});

function selection(
  entity: Entity
): entity is EntityWith<"metadata" | "position"> {
  return isEntityWith(entity, "metadata") && isEntityWith(entity, "position");
}
const s = spiral({
  angle: Math.PI,
  offset: Math.PI,
  center: { x: 0, y: 5, z: 0 },
});

export function sortByTagSystem(model: Model): Model {
  if (!changed) {
    return model;
  }
  changed = false;
  const currentTag = tag;
  const { matching, notMatching } = splitArray(model.entities, selection);

  const sortedByTagSimilarity = matching
    .sort((a, b) => {
      const aTags = a.components.metadata.tags;
      const bTags = a.components.metadata.tags;
      if (aTags.includes(currentTag)) {
        if (bTags.includes(currentTag)) {
          return aTags.length - bTags.length;
        }
        return -1;
      }
      if (b.components.metadata.tags.includes(currentTag)) {
        return 1;
      }
      return 0;
    })
    .map((e, i): Entity => {
      const target = s(i);
      return {
        ...e,
        components: {
          ...e.components,
          age: {
            birthday: model.time,
          },
          scale: { amt: 1 },
          calculateScale: undefined,
          calculatePosition: [
            getLerpToPosComponent(target),
            {
              calculation: (m, e) => {
                const { position } = e.components;
                return { y: m.input.entityUnderMouse === e.id ? 4 : 0 };
              },
            },
          ],
        },
      };
    });

  return {
    ...model,
    entities: [...notMatching, ...sortedByTagSimilarity],
  };
}
