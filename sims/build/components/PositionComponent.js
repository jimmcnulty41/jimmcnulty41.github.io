export function add(p1, p2) {
    return {
        x: p1.x + p2.x,
        y: p1.y + p2.y,
        z: p1.z + p2.z,
    };
}
// a minus b points to a
export function subtract(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    };
}
function length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
export function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
export function manhattanDist(a) {
    return Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z);
}
export function angleBetween(v1, v2) {
    return Math.acos(dot(v1, v2) / (length(v1) * length(v2)));
}
function rotate90(v1) {
    return { x: -v1.y, y: v1.x, z: v1.z };
}
function toRad(degrees) {
    return (degrees * Math.PI) / 180;
}
/**
 * Rotate around up axis, + counterclockwise
 * @param v1
 * @param degrees
 * @returns
 */
export function rotate(v1, degrees) {
    const r = toRad(degrees);
    return {
        x: v1.x * Math.cos(r) - v1.y * Math.sin(r),
        y: v1.x * Math.sin(r) + v1.y * Math.cos(r),
        z: v1.z,
    };
}
function projectOntoGround(v1) {
    return { x: v1.x, y: v1.y, z: 0 };
}
export function isToLeft(p, axis) {
    const q = placeInQuadrant(p, axis);
    return q === 1 || q === 2;
}
// pos x-axis, y-axis in normal graph is q 0, counterclockwise count
export function placeInQuadrant(p, axis) {
    const onGround = projectOntoGround(axis);
    const port = rotate90(onGround);
    const lR = dot(p, port);
    const uD = dot(p, onGround);
    if (lR > 0) {
        if (uD > 0)
            return 1;
        else
            return 2;
    }
    else {
        if (uD > 0)
            return 0;
        else
            return 3;
    }
}
