/**
 * As defined here, this is unidirectional, and calculated from the perspective
 * of "a"
 *
 * @param a
 * @param b
 * @returns 0-1
 */
export function tagSimilarity(a, b) {
    return (a.tags.reduce((sum, t) => (b.tags.includes(t) ? sum + 1 : sum), 0) /
        a.tags.length);
}
