export function addEntityEveryNTicksSystem(entityfn, n) {
    function addEntityEveryNTicksSystem_inner(model) {
        return model.time % n || model.entities.length > 10000
            ? model
            : {
                ...model,
                entities: [...model.entities, entityfn(`${model.idCounter}`)],
                idCounter: model.idCounter + 1,
            };
    }
    return addEntityEveryNTicksSystem_inner;
}
