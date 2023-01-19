import { Entity } from "../Entity.js";
import { Model } from "../Model.js";

type EntityFn = (id: string) => Entity;
type Systemx = (model: Model) => Model;

export function addEntityEveryNTicksSystem(
  entityfn: EntityFn,
  n: number
): Systemx {
  function addEntityEveryNTicksSystem_inner(model: Model): Model {
    return model.time % n || model.entities.length > 100
      ? model
      : {
          ...model,
          entities: [...model.entities, entityfn(`${model.idCounter}`)],
          idCounter: model.idCounter + 1,
        };
  }
  return addEntityEveryNTicksSystem_inner;
}
