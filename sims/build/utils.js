export function vec3Sum(vecs) {
    return vecs.reduce((sum, p) => ({
        x: sum.x + p.x,
        y: sum.y + p.y,
        z: sum.z + p.z,
    }), { x: 0, y: 0, z: 0 });
}
export function remap(min, max, newMin, newMax, clamp) {
    const clampMin = Math.min(newMin, newMax);
    const clampMax = Math.max(newMin, newMax);
    return (input) => {
        const val = newMin + ((input - min) / (max - min)) * (newMax - newMin);
        if (clamp) {
            return Math.max(clampMin, Math.min(clampMax, val));
        }
        else {
            return val;
        }
    };
}
// clamps by default
export function lerp(x, y, t) {
    return (y - x) * t + x;
}
export function splitArray(blah, predicate) {
    const matching = [];
    const notMatching = [];
    blah.forEach((element) => {
        if (predicate(element))
            matching.push(element);
        else
            notMatching.push(element);
    });
    return { matching, notMatching };
}
