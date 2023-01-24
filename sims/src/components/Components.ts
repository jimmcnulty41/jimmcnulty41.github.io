import { Entity } from "../Entity";
import { PositionComponent } from "./PositionComponent";
import {
  GLTFRenderComponent,
  GridRenderComponent,
  RenderComponent,
  RenderTypes,
  SphereRenderComponent,
} from "./RenderComponent";
import { WanderComponent } from "./WanderComponent";

// order should match corresponding system order
export type Components = {
  position?: PositionComponent;
  wander?: WanderComponent;
  render?: RenderComponent;
};

export type PositionedEntity = Entity & {
  components: Components & { position: PositionComponent };
};

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
