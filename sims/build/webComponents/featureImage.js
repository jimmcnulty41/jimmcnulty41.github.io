"use strict";
fetch("/sims/build/webComponents/sketchery-feature.html")
    .then((stream) => stream.text())
    .then((text) => customElements.define("sketchery-feature", class SketcheryFeature extends HTMLElement {
    // Fires when an instance of the element is created or updated
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        const template = document.createElement("template");
        template.innerHTML = text;
        shadow.appendChild(template.content.cloneNode(true));
    }
    // Fires when an instance was inserted into the document
    connectedCallback() { }
    // Fires when an instance was removed from the document
    disconnectedCallback() { }
    // Fires when an attribute was added, removed, or updated
    // attributeChangedCallback(attrName, oldVal, newVal) {}
    // Fires when an element is moved to a new document
    adoptedCallback() { }
}));
