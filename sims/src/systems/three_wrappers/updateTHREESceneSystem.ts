import {
  GridHelper,
  InstancedMesh,
  Euler,
  Object3D,
} from "../../vendor/three.js";

import { Model } from "../../Model.js";
import {
  Components,
  RenderableEntity,
  hasRotation,
  isEntityWith,
  isRenderable,
  isRenderableGrid,
  isRenderableInstanceModel,
  isRenderableModel,
  isRenderableSphere,
} from "../../components/Components.js";
import {
  GLTFRenderComponent,
  GridRenderComponent,
  SupportSceneParent,
  SphereRenderComponent,
  SupportInstance,
  InstancedGLTFRenderComponent,
} from "../../components/RenderComponent.js";
import { RotationComponent, rots } from "../../components/RotationComponent.js";
import { getSubmodel } from "../loadModels.js";

import { inputSystem } from "./inputSystem.js";
import {
  entityIdToInstanceId,
  entityIdToSceneChild,
  instanceIdToEntityId,
  registers,
} from "./threeOptimizations.js";
import { ResolvedTHREEManager } from "./THREEManager.js";

const eulers = rots.map((r) => new Euler(r[0], r[1], r[2]));
function updateSphere(
  tm: ResolvedTHREEManager,
  sphereEntity: RenderableEntity<SphereRenderComponent>
): void {
  return instancedUpdate(tm, sphereEntity, "sphere");
}

function updateBasicRotation(
  tm: ResolvedTHREEManager,
  rotation: RotationComponent,
  childIdx: number
) {
  const { style } = rotation;
  if (style === "standard") {
    const { dix } = rotation;
    tm.scene.children[childIdx].setRotationFromEuler(eulers[dix]);
  } else {
    const { axis, amt } = rotation;
    const euler = new Euler(
      axis === 0 ? amt : 0,
      axis === 1 ? amt : 0,
      axis === 2 ? amt : 0
    );
    tm.scene.children[childIdx].setRotationFromEuler(euler);
  }
}

function updateInstanceRotation(
  tm: ResolvedTHREEManager,
  rotation: RotationComponent
) {
  const { style } = rotation;
  if (style === "angle axis") {
    const { axis, amt } = rotation;
    registers.euler.set(
      axis === 0 ? amt : 0,
      axis === 1 ? amt : 0,
      axis === 2 ? amt : 0
    );
    registers.matrix.makeRotationFromEuler(registers.euler);
  } else {
    registers.matrix.makeRotationFromEuler(eulers[rotation.dix]);
  }
}

function updateInstanceTransform(
  tm: ResolvedTHREEManager,
  components: Components
): void {
  const { matrix, vector } = registers;
  matrix.identity();
  matrix.setPosition(0, 0, 0);
  if (components.rotation) {
    updateInstanceRotation(tm, components.rotation);
  }
  if (components.scale) {
    const { amt } = components.scale;
    if (typeof amt === "number") {
      vector.set(amt, amt, amt);
    } else {
      vector.set(amt[0], amt[1], amt[2]);
    }
    matrix.scale(vector);
  }
  if (components.position) {
    const { x, y, z } = components.position;
    matrix.setPosition(x, y, z);
  }
}

function updateInstanceColor(tm: ResolvedTHREEManager, components: Components) {
  if (components.color) {
    registers.color.setRGB(
      components.color.r,
      components.color.g,
      components.color.b
    );
  } else {
    registers.color.setRGB(0, 0, 0);
  }
}

function instancedUpdate(
  tm: ResolvedTHREEManager,
  entity: RenderableEntity<SupportInstance>,
  instanceKey: string
): void {
  const id = entityIdToInstanceId[entity.id];
  const { inst, idCounter } = tm.instanceMeshes[instanceKey];

  if (id === undefined) {
    updateInstanceColor(tm, entity.components);
    inst.setColorAt(idCounter, registers.color);
    updateInstanceTransform(tm, entity.components);
    inst.setMatrixAt(idCounter, registers.matrix);

    const newCount = idCounter + 1;
    entityIdToInstanceId[entity.id] = idCounter;
    instanceIdToEntityId[inst.name][`${idCounter}`] = entity.id;
    tm.instanceMeshes[instanceKey].idCounter = newCount;
    tm.instanceMeshes[instanceKey].inst.count = newCount;
  } else {
    updateInstanceColor(tm, entity.components);
    inst.setColorAt(id, registers.color);
    updateInstanceTransform(tm, entity.components);
    inst.setMatrixAt(id, registers.matrix);
  }
}

function update3DModel(
  tm: ResolvedTHREEManager,
  value: RenderableEntity<InstancedGLTFRenderComponent>
): void {
  return instancedUpdate(tm, value, value.components.render.refName);
}

function updateSubmodel(
  tm: ResolvedTHREEManager,
  value: RenderableEntity<GLTFRenderComponent>
): void {
  const { refName, objectName } = value.components.render;
  return basicUpdate(tm, value, () => {
    return getSubmodel(refName, objectName);
  });
}

function basicUpdate(
  tm: ResolvedTHREEManager,
  entity: RenderableEntity<SupportSceneParent>,
  createObjFn: () => Object3D
) {
  const id = entityIdToSceneChild[entity.id];
  if (id === undefined) {
    const o = createObjFn();
    tm.scene.add(o);
    entityIdToSceneChild[entity.id] = o.id;
  } else {
    // there's an off-by-one-frame error here and instancedUpdate, if we separate the
    // else condition into a fn and call that fn in the creation case as well,
    // it should fix it
    const childIdx = tm.scene.children.findIndex(
      (c: any) => c.id === entityIdToSceneChild[entity.id]
    );
    if (isEntityWith(entity, "scale")) {
      const { amt } = entity.components.scale;
      if (typeof amt === "number") {
        tm.scene.children[childIdx].scale.set(amt, amt, amt);
      } else {
        tm.scene.children[childIdx].scale.set(amt[0], amt[1], amt[2]);
      }
    }

    if (hasRotation(entity)) {
      updateBasicRotation(tm, entity.components.rotation, childIdx);
    }
    tm.scene.children[childIdx].position.set(
      entity.components.position.x,
      entity.components.position.y,
      entity.components.position.z
    );
  }
}

function updateGrid(
  tm: ResolvedTHREEManager,
  gridEntity: RenderableEntity<GridRenderComponent>
) {
  basicUpdate(tm, gridEntity, () => new GridHelper(100, 10, 0xff0000));
}

export function updateTHREEScene(
  tm: ResolvedTHREEManager,
  model: Model
): Model {
  const renderables = model.entities.filter(isRenderable);
  renderables.filter(isRenderableSphere).forEach((e) => updateSphere(tm, e));
  renderables.filter(isRenderableGrid).forEach((e) => updateGrid(tm, e));
  renderables
    .filter(isRenderableInstanceModel)
    .forEach((e) => update3DModel(tm, e));
  renderables.filter(isRenderableModel).forEach((e) => updateSubmodel(tm, e));

  Object.keys(tm.instanceMeshes).forEach((k) => {
    setInstUpdate(tm.instanceMeshes[k].inst);
  });

  tm.orbitControls.update();
  tm.renderer.render(tm.scene, tm.camera);

  return inputSystem(model);
}

function setInstUpdate(inst: InstancedMesh) {
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) {
    inst.instanceColor.needsUpdate = true;
  }
}
