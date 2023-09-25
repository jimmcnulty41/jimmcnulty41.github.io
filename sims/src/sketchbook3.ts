import {
  data,
  dataToEnhancedUrl,
  dataToUrl,
  getFilteredImages,
  getTags,
} from "./data/data_10.js";
import { getElementRotation, remap } from "./utils.js";

const loadedImages = [];

let missingFiles: string[] = [];
const body = document.querySelector("body");
const numColumns = Math.floor(
  window.innerWidth / (256 /*max size*/ + 24) /*margin*/
);
const scrollCont = document.querySelector("#images");
[...Array(numColumns)].map((x, i) => {
  const d = document.createElement("div");
  d.id = `imageCol_${i}`;
  scrollCont?.appendChild(d);
});

function getImages() {
  return getFilteredImages().map((imageDatum, i) => {
    const url = dataToUrl(imageDatum);
    fetch(url)
      .then((resp) => {
        if (!resp.ok) return;
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
              if (!resp.ok) return;
              return resp.blob();
            })
            .then((enhBlob) => {
              if (!enhBlob) {
                missingFiles.push(imageDatum.new);
                return;
              }
              const container = document.querySelector("#featureContainer");
              if (!container) {
                throw new Error(
                  "feature container missing from sketchbook3.html"
                );
              }

              const enhObjUrl = URL.createObjectURL(enhBlob);
              const featureImg = document.createElement("img");
              featureImg.id = "feature";
              featureImg.src = enhObjUrl;
              const clickHandler = () => {
                container.removeChild(featureImg);
                container.classList.remove("active");
                container.removeEventListener("click", clickHandler);
              };
              container.addEventListener("click", clickHandler);
              container.classList.add("active");
              container.appendChild(featureImg);
            });
        });
        const parent = document.querySelector(`#imageCol_${i % numColumns}`);
        parent?.appendChild(imgEl);
        return imgEl;
      });
  });
}

setInterval(() => {
  console.log(`missing files: ${missingFiles}`);
  missingFiles = [];
}, 10000);

const scalingFn = remap(0, 500, 1, 0, true);

function scaleNode(n: Node, scroll: number = 0) {
  if ((n as HTMLElement).tagName !== "IMG") return;

  const elOffset = (n as HTMLImageElement).offsetTop;
  const blah = scalingFn(Math.abs(elOffset - scroll - window.innerHeight / 3));
  console.log(blah);
  (n as HTMLImageElement).style.scale = `${blah}`;
}

addEventListener("DOMContentLoaded", () => {
  const imageContainer = document.querySelector("#images") as HTMLDivElement;

  getImages();

  imageContainer.childNodes.forEach((c) =>
    c.childNodes.forEach((n) => scaleNode(n, imageContainer.scrollTop))
  );

  imageContainer.addEventListener("scroll", (e) => {
    console.log(window.innerHeight);
    const currentScroll = imageContainer.scrollTop;
    imageContainer.childNodes.forEach((c) => {
      c.childNodes.forEach((n) => scaleNode(n, currentScroll));
    });
  });
});
