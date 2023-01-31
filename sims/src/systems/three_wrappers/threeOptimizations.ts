import { Euler, Color, Matrix4, Vector3 } from "../../vendor/three.js";

// this will probably lead to race conditions
export const registers = {
  matrix: new Matrix4(),
  euler: new Euler(),
  vector: new Vector3(),
  color: new Color(),
};

export const entityIdToSceneChild: EntityIdToThreeId = {};
export const entityIdToInstanceId: EntityIdToThreeId = {};
export const instanceIdToEntityId: THREEIDToEntityId = {};

type EntityIdToThreeId = {
  [entityID: string]: number | undefined;
};
type THREEIDToEntityId = {
  [refName: string]: {
    [threeId: string]: string;
  };
};
