import { dataToEnhancedUrl, dataToUrl, getFilteredImages, } from "../data/data_11.js";
import { n_resolved, remap } from "../lib/utils.js";
let missingFiles = [];
const numColumns = Math.floor(window.innerWidth / (256 /*max size*/ + 24) /*margin*/);
const scrollCont = document.querySelector("#images");
if (!scrollCont)
    throw new Error("init called before scroll cont was inited");
function resetScrollCont() {
    scrollCont.innerHTML = "";
    [...Array(numColumns)].map((_, i) => {
        const d = document.createElement("div");
        d.id = `imageCol_${i}`;
        scrollCont?.appendChild(d);
    });
    scrollCont.scrollTop = 0;
    console.log("scroll container reset");
}
resetScrollCont();
function colFromIndex(i) {
    return document.querySelector(`#imageCol_${i % numColumns}`);
}
function sortByTag(tag) {
    if (!scrollCont)
        throw new Error("scrollCont not defined");
    let elements = Array.from(scrollCont?.children)
        .flatMap((column) => Array.from(column.children))
        .map((n) => ({
        el: n,
        sortOrder: n.getAttribute("tags")?.split(",").includes(tag) ? 0 : 1,
        tags: n.getAttribute("tags")?.split(","),
    }));
    resetScrollCont();
    let sortedElements = [
        ...elements
            .filter((x) => x.tags?.includes(tag))
            .map((x) => {
            x.el.classList.add("highlight");
            return { ...x };
        }),
        ...elements
            .filter((x) => !x.tags?.includes(tag))
            .map((x) => {
            x.el.classList.remove("highlight");
            return { ...x };
        }),
    ];
    sortedElements.forEach((n, i) => {
        let parent = colFromIndex(i);
        parent?.appendChild(n.el);
        n.el.setAttribute("data-i", `${i}`);
    });
}
let feat = {
    el: null,
    next: () => { },
    prev: () => { },
    rotate: (amt) => { },
};
const makeImgClickListener = (imageDatum, imgEl) => (_e) => {
    fetch(dataToEnhancedUrl(imageDatum))
        .then((resp) => {
        if (!resp.ok)
            return;
        return resp.blob();
    })
        .then((enhBlob) => {
        if (!enhBlob) {
            missingFiles.push(imageDatum.new);
            return;
        }
        const container = document.body;
        if (!container) {
            throw new Error("feature container missing from sketchbook3.html");
        }
        const enhObjUrl = URL.createObjectURL(enhBlob);
        feat = {
            el: document.createElement("sketchery-feature"),
            rotate: (amt) => {
                if (feat.el) {
                    const imgEl = feat.el.shadowRoot?.querySelector("img");
                    const curRotation = imgEl.style.rotate == ""
                        ? 0
                        : Number.parseInt(imgEl.style.rotate);
                    imgEl.style.rotate = `${curRotation + amt}deg`;
                }
            },
            next: () => {
                if (feat.el) {
                    feat.el.remove();
                }
                const index = Number.parseInt(imgEl.getAttribute("data-i") || "0");
                const nSib = document.querySelector(`[data-i='${index + 1}']`);
                if (nSib) {
                    nSib.superSpecialFunc();
                }
            },
            prev: () => {
                if (feat.el) {
                    feat.el.remove();
                }
                const index = Number.parseInt(imgEl.getAttribute("data-i") || "0");
                const pSib = document.querySelector(`[data-i='${index - 1}']`);
                if (pSib) {
                    pSib.superSpecialFunc();
                }
            },
        };
        if (!feat.el) {
            console.error("Element not featured");
            return;
        }
        feat.el.setAttribute("src", enhObjUrl);
        feat.el.setAttribute("tags", imageDatum.tags.join(","));
        feat.el.setAttribute("data-name", imageDatum.new);
        feat.el.addEventListener("tag-click", (e) => {
            let xition = document.createElement("xition-wipe");
            xition.setAttribute("preset", "clr_w_clr");
            container.appendChild(xition);
            scrollCont.scroll(0, 100);
            document.querySelector("#highlightedTag").innerText =
                e.detail;
            setTimeout(() => {
                if (feat.el) {
                    feat.el.remove();
                }
                scrollCont.scroll(0, 0);
                sortByTag(e.detail);
            }, 1000);
        });
        feat.el.onclick = () => {
            if (feat.el) {
                feat.el.remove();
            }
        };
        container.appendChild(feat.el);
    });
};
const elFromImgDatum = async (imageDatum, index) => {
    const url = dataToUrl(imageDatum);
    const imgEl = await fetch(url)
        .then((resp) => {
        if (!resp.ok)
            return;
        return resp.blob();
    })
        .then((blob) => {
        if (!blob) {
            missingFiles.push(imageDatum.new);
            return document.createElement("img");
        }
        const objectURL = URL.createObjectURL(blob);
        const imgEl = document.createElement("img");
        imgEl.src = objectURL;
        imgEl.id = imageDatum.new;
        imgEl.setAttribute("tags", imageDatum.tags.join(","));
        imgEl.addEventListener("click", makeImgClickListener(imageDatum, imgEl));
        imgEl.setAttribute("data-i", `${index}`);
        imgEl.superSpecialFunc = makeImgClickListener(imageDatum, imgEl);
        return imgEl;
    });
    const parent = document.querySelector(`#imageCol_${index % numColumns}`);
    parent?.appendChild(imgEl);
};
function getImages() {
    return getFilteredImages().map(elFromImgDatum);
}
setInterval(() => {
    console.log(`missing files: ${missingFiles}`);
    missingFiles = [];
}, 10000);
const scalingFn = remap(0, 500, 1, 0, true);
function scaleNode(n, scroll = 0) {
    if (n.tagName !== "IMG")
        return;
    const elOffset = n.offsetTop;
    const blah = scalingFn(Math.abs(elOffset - scroll - window.innerHeight / 3));
    n.style.scale = `${blah}`;
}
document.addEventListener("DOMContentLoaded", async () => {
    scrollCont.addEventListener("scroll", (e) => {
        const currentScroll = scrollCont.scrollTop;
        scrollCont.childNodes.forEach((c) => {
            c.childNodes.forEach((n) => scaleNode(n, currentScroll));
        });
    });
    await n_resolved(24, getImages());
    scrollCont.childNodes.forEach((c) => c.childNodes.forEach((n) => scaleNode(n, scrollCont.scrollTop)));
});
let lastTrigger = Date.now();
const DEBOUNCE = 233;
document.addEventListener("keydown", (e) => {
    if (Date.now() - lastTrigger < DEBOUNCE) {
        return;
    }
    if (e.key == "Escape") {
        if (feat.el) {
            feat.el.remove();
        }
    }
    if (e.key == "ArrowRight") {
        if (feat) {
            feat.next();
        }
    }
    if (e.key == "ArrowLeft") {
        if (feat) {
            feat.prev();
        }
    }
    if (e.key == "x") {
        if (feat) {
            feat.rotate(90);
        }
    }
    if (e.key == "z") {
        if (feat) {
            feat.rotate(-90);
        }
    }
    lastTrigger = Date.now();
});
