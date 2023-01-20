import { Model } from "../Model.js";
import { canWander, isPositioned } from "../components/Components.js";
import { vec3Sum } from "../utils.js";

export function reportSystem(model: Model): Model {
  console.log(
    model.entities
      .filter(canWander)
      .map((x) => x.components.wander.internalRoll)
  );
  return model;
}
