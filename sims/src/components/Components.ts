import { Entity } from "../lib/Entity";
import {
  AngleAxisRotationComponent,
  RotationComponent,
} from "./RotationComponent";
import { PositionComponent } from "./PositionComponent";
import {
  InitLineRenderComponent,
  InitRenderComponent,
  InitTextRenderComponent,
  RenderComponent,
} from "./RenderComponent";
import { WanderComponent } from "./WanderComponent";
import { LevitateComponent } from "./LevitateComponent";
import {
  CalcPositionComponent,
  CalcRotationComponent,
  CalcScaleComponent,
} from "./CalcTransformComponents";
import { ScaleComponent } from "./ScaleComponent";
import { AgeComponent } from "./AgeComponent";
import { ColorComponent } from "./ColorComponent";
import { WanderTowardComponent } from "./WanderTowardComponent";
import { MetadataComponent } from "./MetadataComponent";
import { ShaderComponent } from "./ShaderComponent";

// order should match corresponding system order
type ComponentTypes = {
  wander: WanderComponent;
  wanderToward: WanderTowardComponent;
  levitate: LevitateComponent;
  age: AgeComponent;

  metadata: MetadataComponent;

  initRender:
    | InitRenderComponent
    | InitLineRenderComponent
    | InitTextRenderComponent;
  render: RenderComponent;
  shader: ShaderComponent;

  rotation: RotationComponent;
  calculateRotation: CalcRotationComponent;
  scale: ScaleComponent;
  calculateScale: CalcScaleComponent;
  color: ColorComponent;
  position: PositionComponent;
  calculatePosition: CalcPositionComponent[];
  tagActive: boolean;
};
export type Components = Partial<ComponentTypes>;
export function levitates(
  e: Entity
): e is EntityWith<"position"> & EntityWith<"levitate"> {
  return isEntityWith(e, "position") && isEntityWith(e, "levitate");
}

export function canWander(
  entity: Entity
): entity is EntityWith<"position" | "wander"> {
  return (
    entity.components.wander !== undefined &&
    entity.components.position !== undefined
  );
}

export function hasRotation(
  entity: Entity
): entity is EntityWith<"position" | "rotation"> {
  return (
    isEntityWith(entity, "position") && entity.components.rotation !== undefined
  );
}

export type RenderableEntity<
  RenderType extends RenderComponent = RenderComponent
> = EntityWith<"position" | "render"> & {
  components: {
    render: RenderType;
  };
};

export type EntityWith<K extends keyof Components> = Entity & {
  components: Components & { [P in K]: ComponentTypes[P] };
};

type EntityWithCalcRotation = Entity & {
  components: Components & {
    calculateRotation: CalcRotationComponent;
    rotation: AngleAxisRotationComponent;
  };
};

export function isRenderable(entity: Entity): entity is RenderableEntity {
  return (
    entity.components.render !== undefined &&
    entity.components.position !== undefined
  );
}

// slightly different from scale / position cuz the "style" property
export function hasCalculatedRotation(e: Entity): e is EntityWithCalcRotation {
  return (
    e.components.calculateRotation !== undefined &&
    e.components.rotation !== undefined &&
    e.components.rotation.style === "angle axis"
  );
}

export function hasCalculatedScale(
  e: Entity
): e is EntityWith<"scale" | "calculateScale"> {
  return (
    e.components.calculateScale !== undefined &&
    e.components.scale !== undefined
  );
}

export function hasCalculatedPosition(
  e: Entity
): e is EntityWith<"position" | "calculatePosition"> {
  return isEntityWith(e, "position") && isEntityWith(e, "calculatePosition");
}

export function isEntityWith<K extends keyof Components>(
  e: Entity,
  componentName: K
): e is EntityWith<K> {
  return e.components[componentName] !== undefined;
}

export function isEntityWithFn<K extends keyof ComponentTypes>(
  componentName: K
) {
  return (e: Entity): e is EntityWith<K> => isEntityWith<K>(e, componentName);
}
