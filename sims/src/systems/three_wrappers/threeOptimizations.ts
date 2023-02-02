import { Components } from "../../components/Components.js";
import { RotationComponent, rots } from "../../components/RotationComponent.js";
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
export const sceneIdToEntityId: { [sceneId: number]: string } = {};

type EntityIdToThreeId = {
  [entityID: string]: number | undefined;
};
type THREEIDToEntityId = {
  [refName: string]: {
    [threeId: string]: string;
  };
};

export const eulers = rots.map((r) => new Euler(r[0], r[1], r[2]));

export function updateColorRegister(components: Components) {
  if (components.color) {
    registers.color.setRGB(
      components.color.r,
      components.color.g,
      components.color.b
    );
  } else {
    registers.color.setRGB(0, 0, 0);
  }
}

function updateMatrixRotation(rotation: RotationComponent) {
  const { style } = rotation;
  if (style === "angle axis") {
    const { axis, amt } = rotation;
    registers.euler.set(
      axis === 0 ? amt : 0,
      axis === 1 ? amt : 0,
      axis === 2 ? amt : 0
    );
    registers.matrix.makeRotationFromEuler(registers.euler);
  } else {
    registers.matrix.makeRotationFromEuler(eulers[rotation.dix]);
  }
}

export function updateMatrixRegister(components: Components): void {
  const { matrix, vector } = registers;
  matrix.identity();
  matrix.setPosition(0, 0, 0);
  if (components.rotation) {
    updateMatrixRotation(components.rotation);
  }
  if (components.scale) {
    const { amt } = components.scale;
    if (typeof amt === "number") {
      vector.set(amt, amt, amt);
    } else {
      vector.set(amt[0], amt[1], amt[2]);
    }
    matrix.scale(vector);
  }
  if (components.position) {
    const { x, y, z } = components.position;
    matrix.setPosition(x, y, z);
  }
}
