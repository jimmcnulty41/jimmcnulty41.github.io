import { isEntityWith } from "../components/Components.js";
import { tagSimilarity } from "../components/MetadataComponent.js";
import { dot, isToLeft, manhattanDist, rotate, subtract, } from "../components/PositionComponent.js";
import { report, splitArray } from "../utils.js";
let vals = [];
report(() => vals, "");
function positionToBlock(p) {
    const scale = 0.3;
    const val = `${Math.floor(p.x / scale)},${Math.floor(p.y / scale)},${Math.floor(p.z / scale)}`;
    return val;
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
    vals.push(blockResidents);
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
                    t: neighbor.components.wanderToward.static
                        ? 1
                        : tagSimilarity(metadata, neighbor.components.metadata),
                }));
                const rotation = blah.reduce((sum, n) => {
                    if (n.t > wanderToward.friendliness) {
                        return sum + n.d;
                    }
                    else {
                        return sum - n.d;
                    }
                }, 0);
                const div = wanderToward.speed > 0 ? wanderToward.speed : 0.0000001;
                const resultingDir = rotate(targetAxis, rotation / div);
                return {
                    ...e,
                    components: {
                        ...unaffected,
                        position: wanderToward.static
                            ? position
                            : {
                                x: position.x + resultingDir.x * wanderToward.speed,
                                y: position.y + resultingDir.y * wanderToward.speed,
                                z: position.z + resultingDir.z * wanderToward.speed,
                            },
                        metadata,
                        wanderToward: {
                            ...wanderToward,
                            target: resultingDir,
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
