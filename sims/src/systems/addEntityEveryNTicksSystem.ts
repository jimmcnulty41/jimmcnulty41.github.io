import { Entity } from "../Entity.js";
import { Model } from "../Model.js";

type EntityFn = (id: string) => Entity;
type Systemx = (model: Model) => Model;

export function addEntityEveryNTicksSystem(
  entityfn: EntityFn,
  n: number,
  delay?: number
): Systemx {
  function addEntityEveryNTicksSystem_inner(model: Model): Model {
    if (delay && model.time < delay) {
      return model;
    }
    return model.time % n || model.entities.length > 1000
      ? model
      : {
          ...model,
          entities: [...model.entities, entityfn(`${model.idCounter}`)],
          idCounter: model.idCounter + 1,
        };
  }
  return addEntityEveryNTicksSystem_inner;
}
