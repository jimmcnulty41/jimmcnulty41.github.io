import { isEntityWith } from "../components/Components.js";
import { splitArray } from "../lib/utils.js";
let tag = "";
let changed = false;
window.addEventListener("JIM_tagSelect", (e) => {
    tag = e.detail || "";
    changed = true;
});
function selection(entity) {
    return isEntityWith(entity, "metadata") && isEntityWith(entity, "position");
}
export function getFilterTagSystem(tm) {
    function filterTagSystem(model) {
        if (!changed) {
            return model;
        }
        changed = false;
        const { matching, notMatching } = splitArray(model.entities, selection);
        return {
            ...model,
            entities: [
                ...notMatching,
                ...matching.map((e) => {
                    return {
                        ...e,
                        components: {
                            ...e.components,
                            tagActive: e.components.metadata.tags.includes(tag),
                        },
                    };
                }),
            ],
        };
    }
    return filterTagSystem;
}
