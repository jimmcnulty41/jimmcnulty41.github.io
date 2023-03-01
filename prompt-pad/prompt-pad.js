import cytoscape from "./cytoscape.esm.min.js";

console.log("loaded");

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
  let blocks =
    document.querySelector("main").children[0].children[0].children[0]
      .children[0].children;
  const nodes = [...blocks]
    .slice(0, blocks.length - 1)
    .map((b) => b.children[0].children[1].children[0].children[0].innerHTML)
    .map((x, i) =>
      i % 2 ? { text: x, source: "AI" } : { text: x, source: "User" }
    )
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
        label: "data(text)",
        width: "100px",
        height: "50px",
        "text-valign": "center",
        "text-halign": "center",
        color: "#fff",
        shape: "rectangle",
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#ccc",
        "target-arrow-color": "#ccc",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
  ],
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
      padding: 30,
      circle: true,
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
