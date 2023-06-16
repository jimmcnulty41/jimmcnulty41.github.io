import { dataToEnhancedUrl, dataToUrl, getFilteredImages, } from "./data/data_10.js";
import { remap } from "./utils.js";
const loadedImages = [];
let missingFiles = [];
const body = document.querySelector("body");
getFilteredImages().map((imageDatum) => {
    const url = dataToUrl(imageDatum);
    fetch(url)
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
        imgEl.addEventListener("click", (e) => {
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
                const enhObjUrl = URL.createObjectURL(enhBlob);
                const featureImg = document.createElement("img");
                featureImg.id = "feature";
                featureImg.src = enhObjUrl;
                featureImg.addEventListener("click", () => body?.removeChild(featureImg));
                document.querySelector("body")?.appendChild(featureImg);
            });
        });
        document.querySelector("#images")?.appendChild(imgEl);
    });
});
setInterval(() => {
    console.log(`missing files: ${missingFiles}`);
    missingFiles = [];
}, 10000);
const scrollContainer = document.querySelector("#images");
const scalingFn = remap(0, 1000, 1, 0, true);
addEventListener("DOMContentLoaded", () => {
    const imageContainer = document.querySelector("#images");
    imageContainer.addEventListener("scroll", (e) => {
        const currentScroll = imageContainer.scrollLeft;
        imageContainer.childNodes.forEach((n) => {
            if (n.tagName !== "IMG")
                return;
            const elOffset = n.offsetLeft;
            const blah = scalingFn(Math.abs(elOffset - currentScroll - window.innerWidth / 4));
            n.style.scale = `${blah}`;
        });
    });
});
