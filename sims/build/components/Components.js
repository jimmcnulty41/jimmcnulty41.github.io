export function levitates(e) {
    return isEntityWith(e, "position") && isEntityWith(e, "levitate");
}
export function canWander(entity) {
    return (entity.components.wander !== undefined &&
        entity.components.position !== undefined);
}
export function hasRotation(entity) {
    return (isEntityWith(entity, "position") && entity.components.rotation !== undefined);
}
export function isRenderable(entity) {
    return (entity.components.render !== undefined &&
        entity.components.position !== undefined);
}
// slightly different from scale / position cuz the "style" property
export function hasCalculatedRotation(e) {
    return (e.components.calculateRotation !== undefined &&
        e.components.rotation !== undefined &&
        e.components.rotation.style === "angle axis");
}
export function hasCalculatedScale(e) {
    return (e.components.calculateScale !== undefined &&
        e.components.scale !== undefined);
}
export function hasCalculatedPosition(e) {
    return isEntityWith(e, "position") && isEntityWith(e, "calculatePosition");
}
export function isEntityWith(e, componentName) {
    return e.components[componentName] !== undefined;
}
export function isEntityWithFn(componentName) {
    return (e) => isEntityWith(e, componentName);
}
