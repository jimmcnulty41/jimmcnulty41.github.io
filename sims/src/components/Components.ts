import { Entity } from "../Entity";
import { PositionComponent } from "./PositionComponent";
import { RenderComponent } from "./RenderComponent";
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

export type RenderableEntity = Entity & {
  components: Components & {
    render: RenderComponent;
    position: PositionComponent;
  };
};

export function isRenderable(entity: Entity): entity is RenderableEntity {
  return (
    entity.components.render !== undefined &&
    entity.components.position !== undefined
  );
}
