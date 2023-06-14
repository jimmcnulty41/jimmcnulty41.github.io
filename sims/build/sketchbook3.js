import { data, dataToUrl, getTags } from "./data/data_9.js";
const missingImgs = [];
data.images.forEach((imgData) => {
    const i = document.createElement("img");
    const src = dataToUrl(imgData);
    i.src = src;
    i.classList.add("loading");
    i.onclick = (e) => {
        const yadda = getTags(i.src);
        const imgV = document.createElement("image-viewer");
        imgV.setAttribute("src", i.src);
        imgV.setAttribute("tags", yadda);
        document.querySelector("body")?.appendChild(imgV);
    };
    const container = document.querySelector("#images");
    i.addEventListener("load", () => {
        container?.appendChild(i);
        i.classList.remove("loading");
    });
    i.addEventListener("error", (e) => {
        missingImgs.push(src);
        e.preventDefault();
    });
});
window.addEventListener("error", (e) => {
    const el = e.currentTarget;
    console.log(el.tagName);
    if (el.tagName === "IMG") {
    }
    e.preventDefault();
});
setTimeout(() => {
    console.log("the following images are missing from the server:");
    console.log(missingImgs);
}, 10000);
