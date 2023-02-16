import { isEntityWith } from "../components/Components.js";
import { tagSimilarity } from "../components/MetadataComponent.js";
import { dot, isToLeft, manhattanDist, rotate, subtract, } from "../components/PositionComponent.js";
import { splitArray } from "../utils.js";
function positionToBlock(p) {
    const scale = 12;
    return `${Math.floor(p.x / scale)}${Math.floor(p.y / scale)}${Math.floor(p.z / scale)}`;
}
function selection(entity) {
    return (isEntityWith(entity, "position") &&
        isEntityWith(entity, "wanderToward") &&
        isEntityWith(entity, "metadata"));
}
export function wanderTowardSystem(model) {
    const { matching, notMatching } = splitArray(model.entities, selection);
    const blockResidents = matching.reduce((blockResidents, e) => {
        const key = positionToBlock(e.components.position);
        return {
            ...blockResidents,
            [key]: blockResidents[key] ? [...blockResidents[key], e] : [],
        };
    }, {});
    return {
        ...model,
        entities: [
            ...notMatching,
            ...matching.map((e) => {
                const { position, metadata, wanderToward, ...unaffected } = e.components;
                const neighbors = blockResidents[positionToBlock(position)].filter((n) => aBetweenBandC(n.components.position, position, wanderToward.target));
                const targetAxis = subtract(wanderToward.target, position);
                const len = manhattanDist(targetAxis);
                const blah = neighbors.map((neighbor) => ({
                    d: isToLeft(neighbor.components.position, targetAxis) ? -1 : 1,
                    t: tagSimilarity(metadata, neighbor.components.metadata),
                }));
                const rotation = blah.reduce((sum, n) => n.d + sum, 0);
                const resultingDir = rotate(targetAxis, rotation);
                return {
                    ...e,
                    components: {
                        ...unaffected,
                        position: {
                            x: position.x + resultingDir.x * wanderToward.speed,
                            y: position.y + resultingDir.y * wanderToward.speed,
                            z: position.z + resultingDir.z * wanderToward.speed,
                        },
                        metadata,
                        wanderToward: {
                            ...wanderToward,
                            target: len < 0.02
                                ? {
                                    x: wanderToward.target.y,
                                    y: wanderToward.target.x,
                                    z: wanderToward.target.z,
                                }
                                : wanderToward.target,
                        },
                    },
                };
            }),
        ],
    };
}
function aBetweenBandC(a, b, c) {
    return (dot(subtract(c, b), subtract(a, b)) > 0 &&
        dot(subtract(b, c), subtract(a, c)) > 0);
}
