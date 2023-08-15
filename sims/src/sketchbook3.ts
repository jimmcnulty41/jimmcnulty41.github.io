import {
  data,
  dataToEnhancedUrl,
  dataToUrl,
  getFilteredImages,
  getTags,
} from "./data/data_10.js";
import { remap } from "./utils.js";

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

getFilteredImages().map((imageDatum, i) => {
  const url = dataToUrl(imageDatum);
  console.log(i);
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
            const enhObjUrl = URL.createObjectURL(enhBlob);
            const featureImg = document.createElement("img");
            featureImg.id = "feature";
            featureImg.src = enhObjUrl;
            featureImg.addEventListener("click", () =>
              body?.removeChild(featureImg)
            );
            document.querySelector("body")?.appendChild(featureImg);
          });
      });
      const parent = document.querySelector(`#imageCol_${i % numColumns}`);
      console.log(parent);
      parent?.appendChild(imgEl);
    });
});

setInterval(() => {
  console.log(`missing files: ${missingFiles}`);
  missingFiles = [];
}, 10000);

const scalingFn = remap(0, 1000, 1, 0, true);

addEventListener("DOMContentLoaded", () => {
  const imageContainer = document.querySelector("#images") as HTMLDivElement;

  imageContainer.addEventListener("scroll", (e) => {
    const currentScroll = imageContainer.scrollTop;
    imageContainer.childNodes.forEach((n) => {
      if ((n as HTMLElement).tagName !== "IMG") return;

      const elOffset = (n as HTMLImageElement).offsetTop;
      const blah = scalingFn(Math.abs(elOffset - currentScroll));
      (n as HTMLImageElement).style.scale = `${blah}`;
    });
  });
});
