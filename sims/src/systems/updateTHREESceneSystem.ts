import * as THREE from "../vendor/three.js";

import { Model } from "../Model.js";
import { RenderComponent } from "../components/RenderComponent.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { isRenderable } from "../components/Components.js";

function getGrid() {
  return new THREE.GridHelper(100, 10, 0xff0000);
}

export function createObject({ type }: RenderComponent) {
  switch (type) {
    case "sphere":
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      return mesh;
    case "grid":
      return getGrid();
  }
}

export function updateTHREEScene(model: Model): Model {
  const sceneMapping = { ...model.sceneMapping };

  model.entities.filter(isRenderable).forEach((e) => {
    if (!isRenderable(e)) {
      return;
    }
    if (!sceneMapping[e.id]) {
      // instance in scene
      const object = createObject(e.components.render);
      scene.add(object);
      sceneMapping[e.id] = object.id;
    } else {
      const childIdx = scene.children.findIndex(
        (c: any) => c.id === sceneMapping[e.id]
      );
      scene.children[childIdx].position.set(
        e.components.position.x,
        e.components.position.y,
        e.components.position.z
      );
    }
  });

  orbitControls.update();
  renderer.render(scene, camera);
  return {
    ...model,
    sceneMapping,
  };
}

let scene = new THREE.Scene();

const canvas = document.querySelector("canvas");
if (!canvas) throw new Error("canvas not found on page");

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);

const orbitControls = new OrbitControls(camera, canvas);
