export function addEntityEveryNTicksSystem(entityfn, n, delay, max = 1000) {
    function addEntityEveryNTicksSystem_inner(model) {
        if (delay && model.time < delay) {
            return model;
        }
        return model.time % n || model.entities.length > max
            ? model
            : {
                ...model,
                entities: [...model.entities, entityfn(`${model.idCounter}`)],
                idCounter: model.idCounter + 1,
            };
    }
    return addEntityEveryNTicksSystem_inner;
}
