import { Entity } from "../Entity.js";
import { Model } from "../Model.js";
import { EntityWith } from "./Components.js";

export interface CalcRotationComponent {
  calculation: (model: Model, entity: Entity) => number;
}
export interface CalcScaleComponent {
  calculation: (model: Model, entity: Entity) => number | number[];
}
export interface CalcPositionComponent {
  calculation: (
    mode: Model,
    entity: EntityWith<"position" | "calculatePosition">
  ) => { x?: number; y?: number; z?: number };
}
