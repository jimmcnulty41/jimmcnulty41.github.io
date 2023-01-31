export interface InputComponent {
  prevEntityUnderMouse?: string;
  entityUnderMouse?: string;
  mouse: number[];
  mouseState?: "down";
}

export const defaultInputComponent = {
  mouse: [0, 0],
  entityUnderMouse: undefined,
};
