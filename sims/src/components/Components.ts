import { Entity } from "../Entity";
import { RotationComponent } from "./RotationComponent";
import { PositionComponent } from "./PositionComponent";
import {
  GLTFRenderComponent,
  GridRenderComponent,
  RenderComponent,
  SphereRenderComponent,
} from "./RenderComponent";
import { WanderComponent } from "./WanderComponent";
import { LevitateComponent } from "./LevitateComponent";

// order should match corresponding system order
export type Components = {
  position?: PositionComponent;
  wander?: WanderComponent;
  render?: RenderComponent;
  rotation?: RotationComponent;
  levitate?: LevitateComponent;
};

export type PositionedEntity = Entity & {
  components: Components & { position: PositionComponent };
};
export type LevitatingEntity = PositionedEntity & {
  components: Components & {
    levitate: LevitateComponent;
  };
};
export function levitates(entity: Entity): entity is LevitatingEntity {
  return isPositioned(entity) && entity.components.levitate !== undefined;
}
export function isPositioned(entity: Entity): entity is PositionedEntity {
  return entity.components.position !== undefined;
}

export type WanderingEntity = Entity & {
  components: Components & {
    wander: WanderComponent;
    position: PositionComponent;
  };
};

export function canWander(entity: Entity): entity is WanderingEntity {
  return (
    entity.components.wander !== undefined &&
    entity.components.position !== undefined
  );
}

export type RotatingEntity<T extends RenderComponent> = Entity & {
  components: Components & {
    render: T;
    position: PositionComponent;
    rotation: RotationComponent;
  };
};
export function hasRotation(
  entity: Entity
): entity is RotatingEntity<RenderComponent> {
  return isPositioned(entity) && entity.components.rotation !== undefined;
}

export type RenderableEntity<T extends RenderComponent> = Entity & {
  components: Components & {
    render: T;
    position: PositionComponent;
  };
};

export function isRenderable(
  entity: Entity
): entity is RenderableEntity<RenderComponent> {
  return (
    entity.components.render !== undefined &&
    entity.components.position !== undefined
  );
}

export function isRenderableSphere(
  entity: Entity
): entity is RenderableEntity<SphereRenderComponent> {
  return (
    entity.components.render !== undefined &&
    entity.components.render.type === "sphere" &&
    entity.components.position !== undefined
  );
}
export function isRenderableModel(
  entity: Entity
): entity is RenderableEntity<GLTFRenderComponent> {
  return (
    entity.components.render !== undefined &&
    entity.components.render.type === "3d model" &&
    entity.components.position !== undefined
  );
}
export function isRenderableGrid(
  entity: Entity
): entity is RenderableEntity<GridRenderComponent> {
  return (
    entity.components.render !== undefined &&
    entity.components.render.type === "grid" &&
    entity.components.position !== undefined
  );
}
