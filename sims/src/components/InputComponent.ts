export interface InputComponent {
  entityUnderMouse?: string;
  mouse: number[];
  mouseState?: "down";
}

export const defaultInputComponent = {
  mouse: [0, 0],
};
