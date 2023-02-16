import { Entity } from "../Entity.js";
import { Model } from "../Model.js";
import { isEntityWith, EntityWith } from "../components/Components.js";
import { tagSimilarity } from "../components/MetadataComponent.js";
import {
  PositionComponent,
  dot,
  isToLeft,
  manhattanDist,
  rotate,
  subtract,
} from "../components/PositionComponent.js";
import { splitArray } from "../utils.js";

function positionToBlock(p: { x: number; y: number; z: number }): string {
  const scale = 12;
  return `${Math.floor(p.x / scale)}${Math.floor(p.y / scale)}${Math.floor(
    p.z / scale
  )}`;
}

type WTEntity = EntityWith<"position" | "wanderToward" | "metadata">;
function selection(entity: Entity): entity is WTEntity {
  return (
    isEntityWith(entity, "position") &&
    isEntityWith(entity, "wanderToward") &&
    isEntityWith(entity, "metadata")
  );
}
type SortedEntities = { [key: string]: WTEntity[] };

export function wanderTowardSystem(model: Model): Model {
  const { matching, notMatching } = splitArray(model.entities, selection);

  const blockResidents = matching.reduce((blockResidents, e) => {
    const key = positionToBlock(e.components.position);
    return {
      ...blockResidents,
      [key]: blockResidents[key] ? [...blockResidents[key], e] : [],
    };
  }, {} as SortedEntities);

  return {
    ...model,
    entities: [
      ...notMatching,
      ...matching.map((e) => {
        const { position, metadata, wanderToward, ...unaffected } =
          e.components;
        const neighbors = blockResidents[positionToBlock(position)].filter(
          (n) =>
            aBetweenBandC(n.components.position, position, wanderToward.target)
        );

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
              target:
                len < 0.02
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

function aBetweenBandC(
  a: PositionComponent,
  b: PositionComponent,
  c: PositionComponent
): boolean {
  return (
    dot(subtract(c, b), subtract(a, b)) > 0 &&
    dot(subtract(b, c), subtract(a, c)) > 0
  );
}
