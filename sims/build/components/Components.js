export function levitates(entity) {
    return isPositioned(entity) && entity.components.levitate !== undefined;
}
export function isPositioned(entity) {
    return entity.components.position !== undefined;
}
export function canWander(entity) {
    return (entity.components.wander !== undefined &&
        entity.components.position !== undefined);
}
export function hasRotation(entity) {
    return isPositioned(entity) && entity.components.rotation !== undefined;
}
export function isRenderable(entity) {
    return (entity.components.render !== undefined &&
        entity.components.position !== undefined);
}
export function isRenderableSphere(entity) {
    return (entity.components.render !== undefined &&
        entity.components.render.type === "sphere" &&
        entity.components.position !== undefined);
}
export function isRenderableInstanceModel(entity) {
    return (entity.components.render !== undefined &&
        entity.components.render.type === "instanced 3d model" &&
        entity.components.position !== undefined);
}
export function isRenderableModel(entity) {
    return (entity.components.render !== undefined &&
        entity.components.render.type === "3d model" &&
        entity.components.position !== undefined);
}
export function isRenderableGrid(entity) {
    return (entity.components.render !== undefined &&
        entity.components.render.type === "grid" &&
        entity.components.position !== undefined);
}
export function isCalcRotation(e) {
    return (e.components.calculateRotation !== undefined &&
        e.components.rotation !== undefined &&
        e.components.rotation.style === "angle axis");
}
export function hasScale(e) {
    return e.components.scale !== undefined;
}
export function isCalcScale(e) {
    return (e.components.calculateScale !== undefined &&
        e.components.scale !== undefined);
}
export function isCalcPosition(e) {
    return (e.components.calculatePosition !== undefined &&
        e.components.position !== undefined);
}
