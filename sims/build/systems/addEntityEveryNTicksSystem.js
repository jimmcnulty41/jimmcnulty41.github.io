export function addEntityEveryNTicksSystem(entityfn, n, delay) {
    function addEntityEveryNTicksSystem_inner(model) {
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
