export function addEntityEveryNTicksSystem(entityfn, n) {
    function addEntityEveryNTicksSystem_inner(model) {
        return model.time % n || model.entities.length > 100
            ? model
            : Object.assign(Object.assign({}, model), { entities: [...model.entities, entityfn(`${model.idCounter}`)], idCounter: model.idCounter + 1 });
    }
    return addEntityEveryNTicksSystem_inner;
}
