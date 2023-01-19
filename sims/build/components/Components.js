export function isPositioned(entity) {
    return entity.components.position !== undefined;
}
export function canWander(entity) {
    return (entity.components.wander !== undefined &&
        entity.components.position !== undefined);
}
export function isRenderable(entity) {
    return (entity.components.render !== undefined &&
        entity.components.position !== undefined);
}
