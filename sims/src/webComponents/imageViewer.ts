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
  private img: HTMLImageElement;
  private rotation: number = 0;
  private size = 256;
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
        }
        div.controls {
            position: fixed;
            opacity:.5;
            transition: .05s;
        }
        div.controls:hover {
            position: fixed;
            opacity:1;
            transition: .05s;
        }

        button > img {
            height: 64px;
        }
        img.theImage {
            transition: .2s;
            transform: rotate(${this.rotation}deg);
            height: ${this.size}px;
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
    } else {
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
  }

  disconnectedCallback() {}

  private minimizeHandler() {
    if (!this.localUrls.lowQ) throw new Error("waiting for load");
    this.img.src = this.localUrls.lowQ;
    this.buttons["maximize"].style.display = "inline";
    this.buttons["minimize"].style.display = "none";
    this.size = 256;
    this.setStyle();
  }

  private maximizeHandler() {
    if (!this.localUrls.highQ) throw new Error("waiting for load");
    this.img.src = this.localUrls.highQ;
    this.buttons["maximize"].style.display = "none";
    this.buttons["minimize"].style.display = "inline";
    this.size = 1024;
    this.setStyle();
  }

  public updateSource(newSrc: string) {
    this.img.src = newSrc;
  }
}

window.customElements.define("image-viewer", ImageViewer);
