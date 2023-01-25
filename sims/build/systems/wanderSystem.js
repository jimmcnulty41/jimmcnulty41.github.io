import { updateStateMachine } from "../StateMachine.js";
import { canWander } from "../components/Components.js";
import { dirs } from "../components/RotationComponent.js";
function entityWander(e) {
    let { position, wander, rotation, ...unaffectedComponents } = e.components;
    const dix = wander.directionIndex;
    if (wander.fsm.current === "forward") {
        position = {
            x: position.x + wander.speed * dirs[dix][0],
            y: position.y + wander.speed * dirs[dix][1],
            z: position.z + wander.speed * dirs[dix][2],
        };
    }
    else if (wander.fsm.current === "turning") {
        const newDix = (dix + 1) % dirs.length;
        wander = {
            ...wander,
            directionIndex: newDix,
        };
        rotation = { dix: newDix };
    }
    wander.fsm = updateStateMachine(e.components.wander.fsm, Math.random());
    return {
        ...e,
        components: {
            ...unaffectedComponents,
            position,
            wander,
            rotation,
        },
    };
}
export function wanderSystem(model) {
    if (model.time % 3)
        return model;
    return {
        ...model,
        entities: [
            ...model.entities.filter(canWander).map(entityWander),
            ...model.entities.filter((x) => !canWander(x)),
        ],
    };
}
