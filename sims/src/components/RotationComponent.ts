export const dirs = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
] as const;

export const rots = [
  [0, Math.PI / 2, 0],
  [0, (3 * Math.PI) / 2, 0],
  [0, 0, 0],
  [0, Math.PI, 0],
];

export type Dirs = typeof dirs[number];
export type Rots = typeof rots[number];

export type StandardRotationComponent = {
  style: "standard";
  dix: number;
};

export type AngleAxisRotationComponent = {
  style: "angle axis";
  amt: number;
  axis: number;
};

export type RotationComponent =
  | StandardRotationComponent
  | AngleAxisRotationComponent;
