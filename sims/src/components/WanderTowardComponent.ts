import { PositionComponent } from "./PositionComponent";

export interface WanderTowardComponent {
  target: PositionComponent;
  speed: number;
  friendliness: number; // 0-1
}
