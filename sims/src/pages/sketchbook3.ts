import {
  ImageMetadata,
  dataToEnhancedUrl,
  dataToUrl,
  getFilteredImages,
} from "../data/data_11.js";
import { n_resolved, remap } from "../lib/utils.js";

let missingFiles: string[] = [];
const numColumns = Math.floor(
  window.innerWidth / (256 /*max size*/ + 24) /*margin*/
);
const scrollCont = document.querySelector("#images");
[...Array(numColumns)].map((_, i) => {
  const d = document.createElement("div");
  d.id = `imageCol_${i}`;
  scrollCont?.appendChild(d);
});

const makeImgClickListener = (imageDatum: ImageMetadata) => (_e: Event) => {
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
      const container = document.body;
      if (!container) {
        throw new Error("feature container missing from sketchbook3.html");
      }

      const enhObjUrl = URL.createObjectURL(enhBlob);
      const feat = document.createElement("sketchery-feature");
      feat.setAttribute("src", enhObjUrl);
      feat.setAttribute("tags", imageDatum.tags.join(","));
      feat.setAttribute("data-name", imageDatum.new);
      feat.addEventListener("tag-click", (e) => {
        container.removeChild(feat);
        let blah = document.createElement("xition-wipe");
        blah.setAttribute("preset", "clr_w_clr");
        container.appendChild(blah);
        console.log(`closing cuz ${(e as any).detail} was clicked`);
      });
      container.appendChild(feat);
    });
};

const elFromImgDatum = (imageDatum: ImageMetadata, index: number) => {
  const url = dataToUrl(imageDatum);
  return fetch(url)
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

function scaleNode(n: Node, scroll: number = 0) {
  if ((n as HTMLElement).tagName !== "IMG") return;

  const elOffset = (n as HTMLImageElement).offsetTop;
  const blah = scalingFn(Math.abs(elOffset - scroll - window.innerHeight / 3));
  (n as HTMLImageElement).style.scale = `${blah}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const imageContainer = document.querySelector("#images") as HTMLDivElement;
  imageContainer.addEventListener("scroll", (e) => {
    const currentScroll = imageContainer.scrollTop;
    imageContainer.childNodes.forEach((c) => {
      c.childNodes.forEach((n) => scaleNode(n, currentScroll));
    });
  });

  await n_resolved(24, getImages());
  imageContainer.childNodes.forEach((c) =>
    c.childNodes.forEach((n) => scaleNode(n, imageContainer.scrollTop))
  );
});
