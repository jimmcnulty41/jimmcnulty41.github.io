import { Model } from "../../Model.js";
import { EntityWith } from "../../components/Components.js";
import { RenderComponent } from "../../components/RenderComponent.js";
import { splitArray } from "../../utils.js";
import { PlaneGeometry } from "../../vendor/three.js";
import { MeshBasicMaterial, SphereGeometry, Mesh } from "../../vendor/three.js";
import { ResolvedTHREEManager } from "./THREEManager.js";
import {
  instanceIdToEntityId,
  registers,
  sceneIdToEntityId,
  updateColorRegister,
  updateMatrixRegister,
} from "./threeOptimizations.js";

export function initTHREEObjectSystem(
  tm: ResolvedTHREEManager,
  model: Model
): Model {
  const { matching, notMatching } = splitArray(
    model.entities,
    (e): e is EntityWith<"initRender"> => e.components.initRender !== undefined
  );
  return {
    ...model,
    entities: [
      ...notMatching,
      ...matching.map((e) => {
        const { initRender, ...unaffected } = e.components;
        return {
          ...e,
          components: {
            ...unaffected,
            render:
              something[initRender.refName] === "instanced"
                ? addObjectToTHREESceneFromInstance(tm, e)
                : addObjectToTHREEScene(tm, e),
          },
        };
      }),
    ],
  };
}
function addObjectToTHREESceneFromInstance(
  tm: ResolvedTHREEManager,
  entity: EntityWith<"initRender">
): RenderComponent {
  const { refName } = entity.components.initRender;
  const { inst, idCounter } =
    tm.instanceMeshes[entity.components.initRender.refName];

  updateColorRegister(entity.components);
  inst.setColorAt(idCounter, registers.color);
  updateMatrixRegister(entity.components);
  inst.setMatrixAt(idCounter, registers.matrix);

  const id = idCounter;

  instanceIdToEntityId[refName][`${id}`] = entity.id;

  const newCount = idCounter + 1;
  tm.instanceMeshes[refName].idCounter = newCount;
  tm.instanceMeshes[refName].inst.count = newCount;

  return {
    type: "instanced",
    refName,
    id,
  };
}

const something: { [refName: string]: "instanced" | "standard" } = {
  rat: "instanced",
};

const meshInitFuncs = {
  sphere: (tm: ResolvedTHREEManager) =>
    new Mesh(
      new SphereGeometry(1, 2, 2),
      new MeshBasicMaterial({ color: 0xff00ff })
    ),
  head_top: (tm: ResolvedTHREEManager) => tm.meshes["head_top"],
  head_bottom: (tm: ResolvedTHREEManager) => tm.meshes["head_bottom"],
  plane: (tm: ResolvedTHREEManager) =>
    new Mesh(
      new PlaneGeometry(10, 12, 2, 2),
      new MeshBasicMaterial({ color: 0xff00ff })
    ),
};
type InitFuncs = typeof meshInitFuncs;
type RefNames = keyof InitFuncs;

function addObjectToTHREEScene(
  tm: ResolvedTHREEManager,
  e: EntityWith<"initRender">
): RenderComponent {
  const { refName } = e.components.initRender;
  const meshFn = meshInitFuncs[refName as RefNames];
  if (!meshFn) {
    throw new Error("unknown refname");
  }

  const o = meshFn(tm);
  tm.scene.add(o);
  const idx = tm.scene.children.findIndex((c) => c.id === o.id);
  sceneIdToEntityId[o.id] = e.id;

  return {
    type: "standard",
    refName,
    id: idx,
  };
}
