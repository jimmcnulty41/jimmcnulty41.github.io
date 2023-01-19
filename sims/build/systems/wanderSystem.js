var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { updateStateMachine } from "../StateMachine.js";
import { dirs, canWander } from "../sim.js";
export function wanderSystem(model) {
    function entityWander(e, i) {
        let _a = e.components, { position, wander } = _a, unaffectedComponents = __rest(_a, ["position", "wander"]);
        const dix = wander.directionIndex;
        if (wander.fsm.current === "forward") {
            position = {
                x: position.x + wander.speed * dirs[dix][0],
                y: position.y + wander.speed * dirs[dix][1],
                z: position.z + wander.speed * dirs[dix][2],
            };
        }
        else if (wander.fsm.current === "turning") {
            wander = Object.assign(Object.assign({}, wander), { directionIndex: (dix + 1) % dirs.length });
        }
        wander.fsm = updateStateMachine(e.components.wander.fsm, Math.random());
        return Object.assign(Object.assign({}, e), { components: Object.assign(Object.assign({}, unaffectedComponents), { position,
                wander }) });
    }
    return Object.assign(Object.assign({}, model), { entities: [
            ...model.entities.filter(canWander).map(entityWander),
            ...model.entities.filter((x) => !canWander(x)),
        ] });
}
