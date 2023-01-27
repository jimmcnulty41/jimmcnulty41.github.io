import { Entity } from "./Entity.js";
import { InputComponent } from "./components/InputComponent.js";

export interface Model {
  time: number;
  entities: Entity[];
  idCounter: number;
  input: InputComponent;
}
