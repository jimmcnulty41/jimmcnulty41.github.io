import { dataToEnhancedUrl, dataToUrl, getFilteredImages, } from "../data/data_11.js";
import { n_resolved, remap } from "../lib/utils.js";
let missingFiles = [];
const numColumns = Math.floor(window.innerWidth / (256 /*max size*/ + 24) /*margin*/);
const scrollCont = document.querySelector("#images");
[...Array(numColumns)].map((_, i) => {
    const d = document.createElement("div");
    d.id = `imageCol_${i}`;
    scrollCont?.appendChild(d);
});
const makeImgClickListener = (imageDatum) => (_e) => {
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
        const container = document.querySelector("#featureContainer");
        if (!container) {
            throw new Error("feature container missing from sketchbook3.html");
        }
        const enhObjUrl = URL.createObjectURL(enhBlob);
        const featureImg = document.createElement("img");
        featureImg.id = "feature";
        featureImg.classList.add(imageDatum.new);
        featureImg.src = enhObjUrl;
        const tagContainer = document.createElement("div");
        tagContainer.id = "tagContainer";
        tagContainer.addEventListener("click", (event) => {
            event.stopPropagation();
        });
        const clickHandler = () => {
            container.removeChild(featureImg);
            container.removeChild(tagContainer);
            container.classList.remove("active");
            container.removeEventListener("click", clickHandler);
        };
        const listEl = document.createElement("ul");
        imageDatum.tags.forEach((tag) => {
            const tagEl = document.createElement("li");
            tagEl.innerText = tag;
            const x = document.createElement("span");
            x.innerText = "---->";
            x.addEventListener("click", () => {
                console.log(`TODO ${tag}`);
                clickHandler();
            });
            tagEl.appendChild(x);
            listEl.appendChild(tagEl);
        });
        tagContainer.appendChild(listEl);
        container.addEventListener("click", clickHandler);
        container.classList.add("active");
        container.appendChild(featureImg);
        container.appendChild(tagContainer);
    });
};
const elFromImgDatum = (imageDatum, index) => {
    const url = dataToUrl(imageDatum);
    return fetch(url)
        .then((resp) => {
        if (!resp.ok)
            return;
        return resp.blob();
    })
        .then((blob) => {
        if (!blob) {
            missingFiles.push(imageDatum.new);
            return;
        }
        const objectURL = URL.createObjectURL(blob);
        const imgEl = document.createElement("img");
        imgEl.src = objectURL;
        imgEl.id = imageDatum.new;
        imgEl.addEventListener("click", makeImgClickListener(imageDatum));
        const parent = document.querySelector(`#imageCol_${index % numColumns}`);
        parent?.appendChild(imgEl);
        return imgEl;
    });
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
    const imageContainer = document.querySelector("#images");
    imageContainer.addEventListener("scroll", (e) => {
        const currentScroll = imageContainer.scrollTop;
        imageContainer.childNodes.forEach((c) => {
            c.childNodes.forEach((n) => scaleNode(n, currentScroll));
        });
    });
    await n_resolved(24, getImages());
    imageContainer.childNodes.forEach((c) => c.childNodes.forEach((n) => scaleNode(n, imageContainer.scrollTop)));
});
