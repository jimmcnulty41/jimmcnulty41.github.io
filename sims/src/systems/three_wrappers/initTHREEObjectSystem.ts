import { Model } from "../../Model.js";
import { EntityWith } from "../../components/Components.js";
import { RenderComponent } from "../../components/RenderComponent.js";
import { splitArray } from "../../utils.js";
import { ResolvedTHREEManager } from "./THREEManager.js";
import { RefNames, meshInitFuncs } from "./loadMeshes.js";
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
              allocationStrategy[initRender.refName] === "instanced"
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

const allocationStrategy: {
  [refName: string]: "instanced" | "standard" | "line";
} = {
  rat: "instanced",
  line: "line",
};

function addObjectToTHREEScene(
  tm: ResolvedTHREEManager,
  e: EntityWith<"initRender">
): RenderComponent {
  const { refName } = e.components.initRender;
  const meshFn = meshInitFuncs[refName as RefNames];
  if (!meshFn) {
    throw new Error("unknown refname");
  }

  const o = meshFn(tm, e);
  tm.scene.add(o);
  const idx = tm.scene.children.findIndex((c) => c.id === o.id);
  sceneIdToEntityId[o.id] = e.id;

  return {
    ...e.components.initRender,
    type: allocationStrategy[refName] || "standard",
    id: idx,
  } as RenderComponent;
}
