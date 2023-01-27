import { Model } from "../Model.js";
import { canWander } from "../components/Components.js";

export function reportSystem(model: Model): Model {
  console.log(
    model.entities
      .filter(canWander)
      .map((x) => x.components.wander.internalRoll)
  );
  return model;
}
