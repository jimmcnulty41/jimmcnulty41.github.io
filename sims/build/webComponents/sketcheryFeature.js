"use strict";
fetch("/sims/build/webComponents/sketcheryFeature.html")
    .then((stream) => stream.text())
    .then((text) => customElements.define("sketchery-feature", class SketcheryFeature extends HTMLElement {
    tagHideButton;
    helpButton;
    // Fires when an instance of the element is created or updated
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        const template = document.createElement("template");
        template.innerHTML = text;
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectHotkeys() {
        document.addEventListener("keypress", (e) => {
            if (e.key == "t") {
                this.tagHideButton.classList.toggle("active");
            }
            if (e.key == "?" || e.key == "h") {
                this.helpButton.classList.toggle("active");
            }
        });
    }
    // Fires when an instance was inserted into the document
    connectedCallback() {
        this.connectHotkeys();
        const ul = this.shadowRoot?.querySelector("#tagContainer");
        if (!ul) {
            throw new Error("zoinktripes!");
        }
        this.helpButton = this.shadowRoot?.querySelector("#helpButton");
        this.helpButton?.addEventListener("click", (e) => {
            this.helpButton.classList.toggle("active");
            e.stopPropagation();
        });
        this.tagHideButton = this.shadowRoot?.querySelector("#tagHideButton");
        this.tagHideButton?.addEventListener("click", (e) => {
            this.tagHideButton.classList.toggle("active");
            e.stopPropagation();
        });
        const tags = this.getAttribute("tags")?.split(",");
        tags?.forEach((tag) => {
            const tagEl = document.createElement("li");
            const x = document.createElement("span");
            x.innerText = tag;
            x.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("tag-click", { detail: tag }));
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
        if (src)
            img.setAttribute("src", src);
    }
    // Fires when an instance was removed from the document
    disconnectedCallback() { }
    // Fires when an attribute was added, removed, or updated
    // attributeChangedCallback(attrName, oldVal, newVal) {}
    // Fires when an element is moved to a new document
    adoptedCallback() { }
}));
