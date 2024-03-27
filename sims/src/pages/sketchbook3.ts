import {
  ImageMetadata,
  dataToEnhancedUrl,
  dataToUrl,
  getFilteredImages,
  getTags,
} from "../data/data_11.js";
import { n_resolved, remap } from "../lib/utils.js";

let missingFiles: string[] = [];
const numColumns = Math.floor(
  window.innerWidth / (256 /*max size*/ + 24) /*margin*/
);
const scrollCont = document.querySelector("#images");
if (!scrollCont) throw new Error("init called before scroll cont was inited");

function resetScrollCont() {
  scrollCont!.innerHTML = "";
  [...Array(numColumns)].map((_, i) => {
    const d = document.createElement("div");
    d.id = `imageCol_${i}`;
    scrollCont?.appendChild(d);
  });
  scrollCont!.scrollTop = 0;
  console.log("scroll container reset");
}
resetScrollCont();

function colFromIndex(i: number) {
  return document.querySelector(`#imageCol_${i % numColumns}`);
}
function sortByTag(tag: string) {
  if (!scrollCont) throw new Error("scrollCont not defined");
  let elements = Array.from(scrollCont?.children)
    .flatMap((c) => Array.from(c.children))
    .map((n) => ({
      el: n,
      sortOrder: n.getAttribute("tags")?.split(",").includes(tag) ? 0 : 1,
      tags: n.getAttribute("tags")?.split(","),
    }));
  resetScrollCont();
  let sortedElements = [
    ...elements.filter((x) => x.tags?.includes(tag)),
    ...elements.filter((x) => !x.tags?.includes(tag)),
  ];
  sortedElements.forEach((n, i) => {
    let parent = colFromIndex(i);
    parent?.appendChild(n.el);
  });
}

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
        let blah = document.createElement("xition-wipe");

        blah.setAttribute("preset", "clr_w_clr");
        container.appendChild(blah);
        setTimeout(() => {
          feat.remove();
          sortByTag((e as any).detail);
        }, 1000);
      });
      feat.onclick = () => feat.remove();
      container.appendChild(feat);
    });
};

const elFromImgDatum = async (imageDatum: ImageMetadata, index: number) => {
  const url = dataToUrl(imageDatum);
  const imgEl = await fetch(url)
    .then((resp) => {
      if (!resp.ok) return;
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
      imgEl.addEventListener("click", makeImgClickListener(imageDatum));
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

function scaleNode(n: Node, scroll: number = 0) {
  if ((n as HTMLElement).tagName !== "IMG") return;

  const elOffset = (n as HTMLImageElement).offsetTop;
  const blah = scalingFn(Math.abs(elOffset - scroll - window.innerHeight / 3));
  (n as HTMLImageElement).style.scale = `${blah}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  scrollCont.addEventListener("scroll", (e) => {
    const currentScroll = scrollCont.scrollTop;
    scrollCont.childNodes.forEach((c) => {
      c.childNodes.forEach((n) => scaleNode(n, currentScroll));
    });
  });

  await n_resolved(24, getImages());
  scrollCont.childNodes.forEach((c) =>
    c.childNodes.forEach((n) => scaleNode(n, scrollCont.scrollTop))
  );
});
