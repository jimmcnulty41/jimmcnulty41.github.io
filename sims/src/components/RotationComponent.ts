export const dirs = [
  [0, 0, 1],
  [0, 0, -1],
  [1, 0, 0],
  [-1, 0, 0],
] as const;
export const rots = [
  [0, 0, 0],
  [0, Math.PI, 0],
  [0, Math.PI / 2, 0],
  [0, (3 * Math.PI) / 2, 0],
];
export type Dirs = typeof dirs[number];
export type Rots = typeof rots[number];

export interface RotationComponent {
  dix: number;
}
