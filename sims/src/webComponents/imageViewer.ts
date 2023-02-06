const baseUrl =
  "https://sketchery-store.nyc3.cdn.digitaloceanspaces.com/enhanced/";

let cache: {
  [url: string]: string;
} = {};

function registerIntoCache(name: string, blobUrl: string) {
  cache[name] = blobUrl;
}
function getFromCache(name: string): string {
  return cache[name];
}
/**
 * takes a single attribute, src\
 * assumes 256 lowQ, 1024 highQ
 * assumes server image locations follow:
 *      ${locationOflowQ}/enhanced/${lowQName}
 */
class ImageViewer extends HTMLElement {
  private buttons: { [name: string]: HTMLButtonElement };
  private tagContainer: HTMLDivElement;
  private img: HTMLImageElement;
  private rotation: number = 0;
  private dimensions = [0, 0];
  private _style: HTMLStyleElement;

  private localUrls: {
    highQ?: string;
    lowQ?: string;
  } = {};

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    const d = document.createElement("div");
    d.classList.add("pageSize");
    shadow.appendChild(d);

    const i = document.createElement("img");
    i.classList.add("theImage");
    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");
    this.img = i;
    wrapper.appendChild(i);
    d.appendChild(wrapper);

    this._style = document.createElement("style");
    this.setStyle();
    d.append(this._style);

    this.buttons = {};

    const controls = document.createElement("div");
    controls.classList.add("controls");
    d.appendChild(controls);

    const l = this.getButton("rotateLeft");
    this.buttons["rotateLeft"] = l;
    controls.appendChild(l);

    const r = this.getButton("rotateRight");
    this.buttons["rotateRight"] = r;
    controls.appendChild(r);

    const max = this.getButton("maximize");
    this.buttons["maximize"] = max;
    controls.appendChild(max);

    const min = this.getButton("minimize");
    min.style.display = "none";
    this.buttons["minimize"] = min;
    controls.appendChild(min);

    const close = this.getButton("close");
    this.buttons["close"] = close;
    controls.appendChild(close);

    const tags = document.createElement("div");
    d.classList.add("tags");
    this.tagContainer = tags;
    d.appendChild(tags);
  }

  private getButton(name: string) {
    const b = document.createElement("button");
    const icon = document.createElement("img");
    icon.setAttribute("src", `/assets/icons/${name}.jpg`);
    b.appendChild(icon);
    return b;
  }

  private setStyle() {
    this._style.innerText = `
        div.pageSize {
            position: fixed;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        div.wrapper {
            max-height: calc(100vh - 64px);
            max-width: calc(100vh - 64px);
        }
        div.controls {
            z-index: 2;
            opacity:.5;
            transition: .05s;
        }
        div.controls:hover {
            opacity:1;
            transition: .05s;
        }
        div.tags {

        }

        button > img {
            height: 64px;
        }

        img.theImage {
            width: ${this.dimensions[0]}px;
            height: ${this.dimensions[1]}px;
            transition: .2s;
            transform: rotate(${this.rotation}deg);
            z-index: 1;
        }
    `;
  }

  connectedCallback() {
    const url = this.getAttribute("src") || "ERROR";
    const name = url.slice(url.search(/\d*.jpg/));
    const enhancedUrl = baseUrl + name;
    if (cache[url]) {
      this.localUrls["lowQ"] = cache[url];
      this.img.src = cache[url];
      this.dimensions = [this.img.naturalWidth, this.img.naturalHeight];
      this.setStyle();
      console.log("from cache");
    } else {
      console.log("not from cache");
      fetch(url)
        .then((response) => {
          if (response.ok) {
            return response.blob();
          }
          throw new Error(`error loading lowQ ${url}`);
        })
        .then((blob) => {
          const bloburl = URL.createObjectURL(blob);
          this.localUrls["lowQ"] = bloburl;
          registerIntoCache(url, bloburl);
          this.img.src = this.localUrls["lowQ"];
          this.img.onload = () => {
            this.dimensions = [this.img.naturalWidth, this.img.naturalHeight];
            this.setStyle();
          };
        });
    }
    if (cache[enhancedUrl]) {
      this.localUrls["highQ"] = cache[enhancedUrl];
      this.img.src = cache[enhancedUrl];
    } else {
      fetch(enhancedUrl)
        .then((response) => {
          if (response.ok) {
            return response.blob();
          }
          throw new Error(`error loading enhanced ${name}`);
        })
        .then((blob) => {
          const bloburl = URL.createObjectURL(blob);
          this.localUrls["highQ"] = bloburl;
          registerIntoCache(enhancedUrl, bloburl);
        });
    }

    this.buttons["rotateRight"].addEventListener("click", (e) => {
      this.rotation += 90;
      this.setStyle();
      e.stopPropagation();
    });
    this.buttons["rotateLeft"].addEventListener("click", (e) => {
      this.rotation -= 90;
      this.setStyle();
      e.stopPropagation();
    });
    this.buttons["maximize"].addEventListener("click", (e) => {
      this.maximizeHandler();
      e.stopPropagation();
    });
    this.buttons["minimize"].addEventListener("click", (e) => {
      this.minimizeHandler();
      e.stopPropagation();
    });
    this.buttons["close"].addEventListener("click", (e) => {
      this.parentNode?.removeChild(this);
      e.stopPropagation();
    });

    const tagAt = this.getAttribute("tags");

    if (tagAt) {
      const tags = tagAt.split(",");
      tags.forEach((t) => {
        const tagEl = document.createElement("button");
        tagEl.innerText = t;
        this.tagContainer.appendChild(tagEl);
      });
    }
  }

  disconnectedCallback() {}

  private minimizeHandler() {
    if (!this.localUrls.lowQ) throw new Error("waiting for load");
    this.img.src = this.localUrls.lowQ;
    this.buttons["maximize"].style.display = "inline";
    this.buttons["minimize"].style.display = "none";
    this.dimensions = [this.img.naturalWidth, this.img.naturalHeight];
    this.setStyle();
  }

  private maximizeHandler() {
    if (!this.localUrls.highQ) throw new Error("waiting for load");
    this.img.src = this.localUrls.highQ;
    this.buttons["maximize"].style.display = "none";
    this.buttons["minimize"].style.display = "inline";
    this.dimensions = [this.img.naturalWidth, this.img.naturalHeight];
    this.setStyle();
  }
}

window.customElements.define("image-viewer", ImageViewer);
