import { Model } from "../Model.js";
import { newDefaultEntity } from "../sim.js";

export function addEntityEveryNTicksSystem(model: Model): Model {
  return model.time % 3 || model.entities.length > 100
    ? model
    : {
        ...model,
        entities: [...model.entities, newDefaultEntity(`${model.idCounter}`)],
        idCounter: model.idCounter + 1,
      };
}
