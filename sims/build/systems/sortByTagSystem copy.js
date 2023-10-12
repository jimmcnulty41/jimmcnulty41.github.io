import { isEntityWith } from "../components/Components.js";
import { grid, splitArray } from "../lib/utils.js";
import { getLerpToPosComponent } from "./calcTransformSystem.js";
let tag = "";
let changed = false;
window.addEventListener("JIM_tagSelect", (e) => {
    tag = e.detail || "";
    changed = true;
});
function selection(entity) {
    return isEntityWith(entity, "metadata") && isEntityWith(entity, "position");
}
export function getSortByTagSystem(tm) {
    const g = grid({
        start: tm.screenToWorld({ x: -0.8, y: 0.8 }),
        end: tm.screenToWorld({ x: 1, y: -1 }),
        numPerRow: 10,
        numPerColumn: 10,
    });
    function sortByTagSystem(model) {
        if (!changed) {
            return model;
        }
        changed = false;
        const currentTag = tag;
        const { matching, notMatching } = splitArray(model.entities, selection);
        const sortedByTagSimilarity = matching
            .sort((a, b) => {
            const aTags = a.components.metadata.tags;
            const bTags = a.components.metadata.tags;
            if (aTags.includes(currentTag)) {
                if (bTags.includes(currentTag)) {
                    return aTags.length - bTags.length;
                }
                return -1;
            }
            if (b.components.metadata.tags.includes(currentTag)) {
                return 1;
            }
            return 0;
        })
            .map((e, i) => {
            const target = g(i);
            return {
                ...e,
                components: {
                    ...e.components,
                    age: {
                        birthday: model.time,
                    },
                    scale: { amt: 1 },
                    calculateScale: undefined,
                    calculateRotation: {
                        calculation: (m, e) => 0,
                    },
                    calculatePosition: [
                        getLerpToPosComponent(target),
                        {
                            calculation: (m, e) => {
                                const { position } = e.components;
                                return { y: m.input.entityUnderMouse === e.id ? 4 : 0 };
                            },
                        },
                    ],
                },
            };
        });
        return {
            ...model,
            entities: [...notMatching, ...sortedByTagSimilarity],
        };
    }
    return sortByTagSystem;
}
