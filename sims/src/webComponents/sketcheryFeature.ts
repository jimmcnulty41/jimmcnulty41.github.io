fetch("/sims/build/webComponents/sketcheryFeature.html")
  .then((stream) => stream.text())
  .then((text) =>
    customElements.define(
      "sketchery-feature",
      class SketcheryFeature extends HTMLElement {
        // Fires when an instance of the element is created or updated
        constructor() {
          super();
          const shadow = this.attachShadow({ mode: "open" });
          const template = document.createElement("template");
          template.innerHTML = text;
          shadow.appendChild(template.content.cloneNode(true));
        }

        // Fires when an instance was inserted into the document
        connectedCallback() {
          const tags = this.getAttribute("tags")?.split(",");

          const ul = this.shadowRoot?.querySelector("#tagContainer > ul");
          if (!ul) {
            throw new Error("zoinktripes!");
          }
          tags?.forEach((tag: string) => {
            const tagEl = document.createElement("li");
            tagEl.innerText = tag;
            const x = document.createElement("span");
            x.innerText = "---->";
            x.addEventListener("click", () => {
              console.log(`TODO emit from here? ${tag}`);
            });
            tagEl.appendChild(x);
            ul.appendChild(tagEl);
          });

          const img = this.shadowRoot?.querySelector("#featureContainer > img");
          if (!img) {
            throw new Error("yikes");
          }
          const src = this.getAttribute("src");
          img.id = "feature";
          if (src) img.setAttribute("src", src);
        }

        // Fires when an instance was removed from the document
        disconnectedCallback() {}

        // Fires when an attribute was added, removed, or updated
        // attributeChangedCallback(attrName, oldVal, newVal) {}

        // Fires when an element is moved to a new document
        adoptedCallback() {}
      }
    )
  );
