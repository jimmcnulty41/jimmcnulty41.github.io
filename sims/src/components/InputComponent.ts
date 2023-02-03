export interface InputComponent {
  prevEntityUnderMouse?: string;
  entityUnderMouse?: string;
  mouse: number[];
  mouseState: "down" | "whatevs" | string;
}

export const defaultInputComponent = {
  mouse: [0, 0],
  mouseState: "whatevs",
};
