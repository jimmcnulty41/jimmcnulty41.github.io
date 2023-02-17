import { report } from "../utils.js";
/**
 * As defined here, this is unidirectional, and calculated from the perspective
 * of "a"
 *
 * @param a
 * @param b
 * @returns 0-1
 */
export function tagSimilarity(a, b) {
    const val = a.tags.length
        ? a.tags.reduce((sum, t) => (b.tags.includes(t) ? sum + 1 : sum), 0) /
            a.tags.length
        : 0;
    vals.push(val);
    if (isNaN(val))
        console.log(a, b);
    return val;
}
let vals = [];
report(() => vals);
