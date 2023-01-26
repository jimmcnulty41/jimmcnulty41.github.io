export interface CalcRotationComponent {
  calculation: (t: number) => number;
}
export interface CalcScaleComponent {
  calculation: (t: number) => number | number[];
}
export interface CalcPositionComponent {
  calculation: (t: number) => { x: number; y: number; z: number };
}
