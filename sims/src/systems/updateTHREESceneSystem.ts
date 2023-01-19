import { Model } from "../Model.js";
import { isRenderable, createObject, scene, orbitControls } from "../sim.js";

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
        (c) => c.id === sceneMapping[e.id]
      );
      scene.children[childIdx].position.set(
        e.components.position.x,
        e.components.position.y,
        e.components.position.z
      );
    }
  });

  orbitControls.update();
  return {
    ...model,
    sceneMapping,
  };
}
