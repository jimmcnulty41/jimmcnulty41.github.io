import { Entity } from "./Entity.js";
import { InputComponent } from "./components/InputComponent.js";
import { Euler } from "./vendor/three.js";

export interface Model {
  time: number;
  entities: Entity[];
  idCounter: number;
  input: InputComponent;
  cameraRotation: number;
}
