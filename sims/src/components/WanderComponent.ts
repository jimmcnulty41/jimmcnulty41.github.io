import { StateMachine } from "../StateMachine.js";

export type WanderStates = "turning" | "forward";

export interface WanderComponent {
  directionIndex: number;
  speed: number;
  internalRoll: number;
  fsm: StateMachine<WanderStates>;
}
