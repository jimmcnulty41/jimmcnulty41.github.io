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
