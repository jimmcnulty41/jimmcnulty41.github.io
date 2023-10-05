import { Entity } from "./Entity.js";
import { InputComponent } from "../components/InputComponent.js";

export type Achievement = (e: Entity[]) => string;

export interface Toast {
  expirationTime: number;
  message: string;
  needsInit: boolean;
}
export interface Model {
  time: number;
  entities: Entity[];
  idCounter: number;
  input: InputComponent;
  cameraRotation: number;
  achievements: string[];
  toasts: Toast[];
}
