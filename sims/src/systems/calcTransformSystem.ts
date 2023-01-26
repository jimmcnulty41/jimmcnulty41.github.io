import { Model } from "../Model.js";
import {
  isCalcPosition,
  isCalcRotation,
  isCalcScale,
} from "../components/Components.js";

export function calcRotationSystem(model: Model): Model {
  return {
    ...model,
    entities: [
      ...model.entities.filter((e) => !isCalcRotation(e)),
      ...model.entities.filter(isCalcRotation).map((e) => {
        const { rotation, calculateRotation, ...unaffectedComponents } =
          e.components;
        rotation.amt = calculateRotation.calculation(model.time);
        return {
          ...e,
          components: {
            ...unaffectedComponents,
            calculateRotation,
            rotation,
          },
        };
      }),
    ],
  };
}

export function calcScaleSystem(model: Model): Model {
  return {
    ...model,
    entities: [
      ...model.entities.filter((e) => !isCalcScale(e)),
      ...model.entities.filter(isCalcScale).map((e) => {
        const { scale, calculateScale, ...unaffectedComponents } = e.components;
        scale.amt = calculateScale.calculation(model.time);
        return {
          ...e,
          components: {
            ...unaffectedComponents,
            calculateScale,
            scale,
          },
        };
      }),
    ],
  };
}

export function calcPositionSystem(model: Model): Model {
  return {
    ...model,
    entities: [
      ...model.entities.filter((e) => !isCalcPosition(e)),
      ...model.entities.filter(isCalcPosition).map((e) => {
        const { position, calculatePosition, ...unaffectedComponents } =
          e.components;
        const val = calculatePosition.calculation(model.time);
        return {
          ...e,
          components: {
            ...unaffectedComponents,
            calculatePosition,
            position: val,
          },
        };
      }),
    ],
  };
}
