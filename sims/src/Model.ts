import { Entity } from "./Entity.js";

export interface Model {
  time: number;
  entities: Entity[];
  idCounter: number;
}
