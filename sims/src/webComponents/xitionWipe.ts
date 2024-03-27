fetch("/sims/build/webComponents/xitionWipe.html")
  .then((stream) => stream.text())
  .then((text) =>
    customElements.define(
      "xition-wipe",
      class XitionWipe extends HTMLElement {
        private handler(e: Event) {}
        // Fires when an instance of the element is created or updated
        constructor() {
          super();
          const shadow = this.attachShadow({ mode: "open" });
          const template = document.createElement("template");
          template.innerHTML = text;
          shadow.appendChild(template.content.cloneNode(true));
          let blah = shadow.querySelector("div");

          setTimeout(() => this.remove(), 6000); // match with animation time in css
        }

        getPresetGradient(presetName: string | null) {
          const lPreset = presetName || "b_to_w";
          switch (lPreset) {
            case "clr_w_clr":
              return "linear-gradient(90deg, #0000, #AAAF, #AAAF, #0000)";
            case "b_to_w":
            default:
              return "linear-gradient(90deg, #000, #000, #AAAF, #0000)";
          }
        }

        // Fires when an instance was inserted into the document
        connectedCallback() {
          const shadow = this.shadowRoot;
          const blah = shadow?.querySelector("div");
          if (!blah) return;

          const preset = this.getAttribute("preset");

          blah.style.setProperty(
            "--preset-gradient",
            this.getPresetGradient(preset)
          );
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
