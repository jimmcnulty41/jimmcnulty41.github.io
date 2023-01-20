import { StateMachine } from "../StateMachine.js";

export const dirs = [
  [0, 0, 1],
  [0, 0, -1],
  [1, 0, 0],
  [-1, 0, 0],
] as const;

export type Dirs = typeof dirs[0];
export type WanderStates = "turning" | "forward";

export interface WanderComponent {
  directionIndex: number;
  speed: number;
  internalRoll: number;
  fsm: StateMachine<WanderStates>;
}
