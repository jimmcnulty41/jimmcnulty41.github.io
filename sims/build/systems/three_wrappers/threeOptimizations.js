import { Euler, Matrix4, Vector3 } from "../../vendor/three.js";
// this will probably lead to race conditions
export const registers = {
    matrix: new Matrix4(),
    euler: new Euler(),
    vector: new Vector3(),
};
export const entityIdToSceneChild = {};
export const entityIdToInstanceId = {};
export const instanceIdToEntityId = {};
