import { InstancedMesh, Vector3 } from "../../vendor/three.js";

import { Model } from "../../Model.js";
import {
  Components,
  EntityWith,
  RenderableEntity,
  hasRotation,
  isEntityWith,
} from "../../components/Components.js";

import { inputSystem } from "./inputSystem.js";
import {
  registers,
  updateColorRegister,
  updateMatrixRegister,
} from "./threeOptimizations.js";
import { ResolvedTHREEManager } from "./THREEManager.js";
import { splitArray } from "../../utils.js";
import {
  InstancedRenderComponent,
  StandardRenderComponent,
} from "../../components/RenderComponent.js";

function instancedUpdate(
  tm: ResolvedTHREEManager,
  entity: RenderableEntity<InstancedRenderComponent>
): void {
  const { id, refName } = entity.components.render;
  const { inst } = tm.instanceMeshes[refName];

  updateColorRegister(entity.components);
  inst.setColorAt(id, registers.color);
  updateMatrixRegister(entity.components);
  inst.setMatrixAt(id, registers.matrix);
}

function standardUpdate(
  tm: ResolvedTHREEManager,
  entity: RenderableEntity<StandardRenderComponent>
): void {
  const childIdx = entity.components.render.id;
  if (isEntityWith(entity, "scale")) {
    const { amt } = entity.components.scale;
    if (typeof amt === "number") {
      tm.scene.children[childIdx].scale.set(amt, amt, amt);
    } else {
      tm.scene.children[childIdx].scale.set(amt[0], amt[1], amt[2]);
    }
  }

  if (hasRotation(entity)) {
    updateMatrixRegister({ rotation: entity.components.rotation });
    tm.scene.children[childIdx].setRotationFromMatrix(registers.matrix);
  }
  tm.scene.children[childIdx].position.set(
    entity.components.position.x,
    entity.components.position.y,
    entity.components.position.z
  );
}

export function updateTHREEScene(
  tm: ResolvedTHREEManager,
  model: Model
): Model {
  const { matching: renderable, notMatching: notRenderable } = splitArray(
    model.entities,
    (e): e is EntityWith<"render" | "position"> =>
      isEntityWith(e, "position") && isEntityWith(e, "render")
  );

  renderable.forEach((e) => {
    switch (e.components.render.type) {
      case "instanced":
        instancedUpdate(tm, e as RenderableEntity<InstancedRenderComponent>);
        return;
      case "standard":
        standardUpdate(tm, e as RenderableEntity<StandardRenderComponent>);
        return;
    }
  });

  Object.keys(tm.instanceMeshes).forEach((k) => {
    setInstUpdate(tm.instanceMeshes[k].inst);
  });

  tm.orbitControls.update();
  tm.renderer.render(tm.scene, tm.camera);

  return inputSystem(tm, model);
}

function setInstUpdate(inst: InstancedMesh) {
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) {
    inst.instanceColor.needsUpdate = true;
  }
}
