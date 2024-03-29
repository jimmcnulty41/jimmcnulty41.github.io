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
    const o = document.createElement("div");
    o.classList.add("overlay");
    d.appendChild(o);

    const wrapper = document.createElement("div");
    wrapper.classList.add("wrapper");
    const i = document.createElement("img");
    i.classList.add("theImage");
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

    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("buttons");
    controls.appendChild(buttonDiv);

    const l = this.getButton("rotateLeft");
    this.buttons["rotateLeft"] = l;
    buttonDiv.appendChild(l);

    const r = this.getButton("rotateRight");
    this.buttons["rotateRight"] = r;
    buttonDiv.appendChild(r);

    const close = this.getButton("close");
    this.buttons["close"] = close;
    buttonDiv.appendChild(close);

    const tags = document.createElement("div");
    tags.classList.add("tags");
    this.tagContainer = tags;
    controls.appendChild(tags);
  }

  private getButton(name: string) {
    const b = document.createElement("button");
    const icon = document.createElement("img");
    icon.setAttribute("src", `/assets/icons/${name}.jpg`);
    b.appendChild(icon);
    return b;
  }

  private getDisplayDims() {
    const larger = Math.max(this.dimensions[0], this.dimensions[1]);
    const smallerWindowDim = Math.min(
      window.innerWidth,
      window.innerHeight - 128
    );

    const scale = smallerWindowDim / larger;

    return {
      width: this.dimensions[0] * scale,
      height: this.dimensions[1] * scale,
    };
  }

  private setStyle() {
    const { width, height } = this.getDisplayDims();
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
        div.overlay {
            height:100%;
            width:100%;
            position: absolute;
            background-color: #333;
            opacity: .8;
        }
        div.wrapper {
        }
        div.controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
        }
        div.buttons > button {
          padding: 0;
        }
        div.tags {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-between;
          overflow: scrolly;
        }
        div.tags > button {
          text-decoration: none;
          border: none;
          margin: 4px;
          background: yellow;
          color: #6D6D6D;
          font-weight: bolder;
        }
        div.tags > button:hover {
          color: #333;
        }

        button > img {
            height: 64px;
        }

        img.theImage {
            width: ${width}px;
            height: ${height}px;
            transition: .2s;
            transform: rotate(${this.rotation}deg);
            z-index: 1;
        }
    `;
  }

  private setImage(name: "highQ" | "lowQ") {
    this.img.src = this.localUrls[name] as string;
    this.img.onload = () => {
      this.dimensions = [this.img.naturalWidth, this.img.naturalHeight];
      this.setStyle();
    };
  }

  connectedCallback() {
    const url = this.getAttribute("src") || "ERROR";
    const name = url.slice(url.search(/\d*.jpg/));
    const enhancedUrl = baseUrl + name;
    if (cache[url]) {
      console.log("from cache");
      this.localUrls["lowQ"] = cache[url];
      this.setImage("lowQ");
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
        });
    }
    if (cache[enhancedUrl]) {
      this.localUrls["highQ"] = cache[enhancedUrl];
      this.setImage("highQ");
    } else {
      fetch(enhancedUrl)
        .then((response) => {
          if (response.ok) {
            return response.blob();
          }
          console.log(`error loading enhanced ${name}`);
        })
        .then((blob) => {
          if (!blob) return;
          const bloburl = URL.createObjectURL(blob);
          this.localUrls["highQ"] = bloburl;
          registerIntoCache(enhancedUrl, bloburl);
          this.setImage("highQ");
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
        tagEl.onclick = () => {
          const event = new CustomEvent("JIM_tagSelect", {
            detail: t,
          });
          window.dispatchEvent(event);
          this.parentNode?.removeChild(this);
        };
        this.tagContainer.appendChild(tagEl);
      });
    }
  }

  disconnectedCallback() {}
}

window.customElements.define("image-viewer", ImageViewer);
