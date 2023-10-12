import { Entity } from "../lib/Entity.js";
import { Model } from "../lib/Model.js";
import { CalcPositionComponent } from "../components/CalcTransformComponents.js";
import { EntityWith, isEntityWith } from "../components/Components.js";
import { grid, spiral, splitArray } from "../lib/utils.js";
import { getLerpToPosComponent } from "./calcTransformSystem.js";
import { ResolvedTHREEManager } from "./three_wrappers/THREEManager.js";

let tag = "";
let changed = false;

window.addEventListener("JIM_tagSelect", (e) => {
  tag = (e as CustomEvent).detail || "";
  changed = true;
});

function selection(
  entity: Entity
): entity is EntityWith<"metadata" | "position"> {
  return isEntityWith(entity, "metadata") && isEntityWith(entity, "position");
}

export function getFilterTagSystem(tm: ResolvedTHREEManager) {
  function filterTagSystem(model: Model): Model {
    if (!changed) {
      return model;
    }
    changed = false;

    const { matching, notMatching } = splitArray(model.entities, selection);

    return {
      ...model,
      entities: [
        ...notMatching,
        ...matching.map((e) => {
          return {
            ...e,
            components: {
              ...e.components,
              tagActive: e.components.metadata.tags.includes(tag),
            },
          };
        }),
      ],
    };
  }
  return filterTagSystem;
}
