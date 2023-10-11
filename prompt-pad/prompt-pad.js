import cytoscape from "./cytoscape.esm.min.js";

/**
 * {
 * nodes: {[id:string]: Node} },
 * edges: {[id:string]: Edge}},
 * }
 */
let data = { nodes: {}, edges: {} };

function mergeInNewData(newData) {
  newData.nodes.forEach((n) => {
    data.nodes[n.id] = n;
  });
  newData.edges.forEach((e) => {
    data.edges[e.id] = e;
  });
}

document.addEventListener("paste", (e) => {
  const pasteContent = e.clipboardData.getData("text/plain");
  if (!pasteContent) return;
  const parsed = JSON.parse(pasteContent);
  mergeInNewData(parsed);
  updateView(data);
});

function scrape() {
  function generateId(str) {
    let hash = 0;
    if (str.length === 0) {
      return hash.toString();
    }
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString();
  }
  let blocks = [...document.querySelectorAll("[data-testid]")]
    .filter((x) => x.getAttribute("data-testid").includes("conversation"))
    .map((x) => x.querySelectorAll(".break-words > div")[0]);

  const nodes = [...blocks]
    .map((x, i) => {
      const n =
        i % 2
          ? { text: x.innerHTML, source: "AI" }
          : { text: x.textContent, source: "User" };
      console.log(x);
      return n;
    })
    .map((x) => ({ ...x, id: generateId(x.text + x.source) }));
  const edges = nodes.slice(1).map((x, i) => ({
    id: nodes[i].id + "e" + x.id,
    from: nodes[i].id,
    to: x.id,
  }));
  return { nodes, edges };
}

const oneliner = `(${scrape.toString()})()`;

const copyButton = document.getElementById("copy-button");

copyButton.addEventListener("click", function () {
  // code to copy to clipboard goes here
  navigator.clipboard.writeText(oneliner);
});

const cy = cytoscape({
  container: document.getElementById("cy"),
  elements: [],

  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(shortText)",
        width: "200px",
        height: "200px",
        "text-valign": "center",
        "text-halign": "center",
        color: "#fff",
        shape: "rectangle",
        "text-wrap": "wrap",
        "text-max-width": "180px",
      },
    },
    {
      selector: "edge",
      style: {
        width: 24,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
  ],
});

function Popover({ position, text }) {
  const el = document.createElement("div");
  el.style = `position: fixed; top: ${position.y}px; left: ${position.x}px; background-color: honeydew; border-radius: 12px; padding: 20px;`;
  el.id = "popover";
  if (text.indexOf("<div") === 0) {
    el.innerHTML = text;
  } else {
    el.innerText = text;
  }
  return el;
}

function clearPopover() {
  const existing = document.querySelector("#popover");
  if (existing) {
    document.body.removeChild(existing);
  }
}

cy.on("tap", () => {
  clearPopover();
});

cy.on("tap", "node", (n) => {
  clearPopover();
  document.body.appendChild(
    Popover({ position: n.renderedPosition, text: n.target.data().text })
  );
});

cy.on("tapdrag", (n) => {
  if (n.originalEvent.type === "mousemove") {
    if (n.originalEvent.buttons !== 1) return;
  }
  clearPopover();
});

function updateView(data) {
  const elements = [
    ...Object.values(data.nodes).map((n) => ({
      group: "nodes",
      id: n.id,
      data: {
        id: n.id,
        source: n.source,
        text: n.text,
        shortText: n.text.slice(0, 128),
      },
    })),
    ...Object.values(data.edges).map((e) => ({
      group: "edges",
      id: e.id,
      data: {
        id: e.id,
        source: e.from,
        target: e.to,
      },
    })),
  ];
  cy.json({ elements })
    .layout({
      name: "breadthfirst",
      directed: true,
    })
    .run();
}

import { test_data_1 } from "./test_data_1.js";
import { test_data_2 } from "./test_data_2.js";
const test1 = document.getElementById("test1");
const test2 = document.getElementById("test2");

test1.addEventListener("click", function () {
  // code to copy to clipboard goes here
  navigator.clipboard.writeText(JSON.stringify(test_data_1));
});
test2.addEventListener("click", function () {
  // code to copy to clipboard goes here
  navigator.clipboard.writeText(JSON.stringify(test_data_2));
});
