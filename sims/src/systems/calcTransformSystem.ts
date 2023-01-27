import { Model } from "../Model.js";
import { AgeComponent } from "../components/AgeComponent.js";
import {
  hasCalculatedPosition,
  hasCalculatedRotation,
  hasCalculatedScale,
} from "../components/Components.js";

function getT(modelTime: number, age?: AgeComponent) {
  const hbd = age?.birthday !== undefined ? age.birthday : 0;
  return modelTime - hbd;
}

export function calcRotationSystem(model: Model): Model {
  return {
    ...model,
    entities: [
      ...model.entities.filter((e) => !hasCalculatedRotation(e)),
      ...model.entities.filter(hasCalculatedRotation).map((e) => {
        const { rotation, calculateRotation, ...unaffectedComponents } =
          e.components;
        rotation.amt = calculateRotation.calculation(
          getT(model.time, e.components.age)
        );
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
      ...model.entities.filter((e) => !hasCalculatedScale(e)),
      ...model.entities.filter(hasCalculatedScale).map((e) => {
        const { scale, calculateScale, ...unaffectedComponents } = e.components;
        scale.amt = calculateScale.calculation(
          getT(model.time, e.components.age)
        );
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
      ...model.entities.filter((e) => !hasCalculatedPosition(e)),
      ...model.entities.filter(hasCalculatedPosition).map((e) => {
        const { position, calculatePosition, ...unaffectedComponents } =
          e.components;
        const { x, y, z } = calculatePosition.calculation(
          getT(model.time, e.components.age)
        );
        const pos = {
          x: x === undefined ? position.x : x,
          y: y === undefined ? position.y : y,
          z: z === undefined ? position.z : z,
        };
        return {
          ...e,
          components: {
            ...unaffectedComponents,
            calculatePosition,
            position: pos,
          },
        };
      }),
    ],
  };
}
