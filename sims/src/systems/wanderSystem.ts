import { updateStateMachine } from "../StateMachine.js";
import { Model } from "../Model.js";
import { WanderingEntity, Entity, dirs, canWander } from "../sim.js";

export function wanderSystem(model: Model): Model {
  function entityWander(e: WanderingEntity, i: number): Entity {
    let { position, wander, ...unaffectedComponents } = e.components;
    const dix = wander.directionIndex;

    if (wander.fsm.current === "forward") {
      position = {
        x: position.x + wander.speed * dirs[dix][0],
        y: position.y + wander.speed * dirs[dix][1],
        z: position.z + wander.speed * dirs[dix][2],
      };
    } else if (wander.fsm.current === "turning") {
      wander = {
        ...wander,
        directionIndex: (dix + 1) % dirs.length,
      };
    }

    wander.fsm = updateStateMachine(e.components.wander.fsm, Math.random());

    return {
      ...e,
      components: {
        ...unaffectedComponents,
        position,
        wander,
      },
    };
  }

  return {
    ...model,
    entities: [
      ...model.entities.filter(canWander).map(entityWander),
      ...model.entities.filter((x) => !canWander(x)),
    ],
  };
}
