import { isEntityWith } from "../components/Components.js";
import { remap, splitArray } from "../utils.js";
import { getLerpToPosComponent } from "./calcTransformSystem.js";
let tag = "";
let changed = false;
window.addEventListener("tagSelect", (e) => {
    tag = e.detail || "";
    changed = true;
});
function selection(entity) {
    return isEntityWith(entity, "metadata") && isEntityWith(entity, "position");
}
export function sortByTagSystem(model) {
    if (!changed) {
        return model;
    }
    console.log(tag);
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
        const center = { x: 0, y: 5, z: 0 };
        const p = remap(0, 256, 6, 100, true)(i);
        const modAmt = (4 * Math.PI) / 3;
        const theta = (i % modAmt) + (3 * Math.PI) / 4;
        const target1 = {
            x: center.x + Math.cos(theta) * p,
            y: center.y - p / 4,
            z: center.z + Math.sin(theta) * p,
        };
        return {
            ...e,
            components: {
                ...e.components,
                age: {
                    birthday: model.time,
                },
                scale: { amt: 1 },
                calculateScale: undefined,
                calculatePosition: [
                    getLerpToPosComponent(target1),
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
