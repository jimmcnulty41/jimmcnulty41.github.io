import { PositionComponent } from "./components/PositionComponent";

export function vec3Sum(vecs: { x: number; y: number; z: number }[]) {
  return vecs.reduce(
    (sum, p) => ({
      x: sum.x + p.x,
      y: sum.y + p.y,
      z: sum.z + p.z,
    }),
    { x: 0, y: 0, z: 0 }
  );
}

export function remap(
  min: number,
  max: number,
  newMin: number,
  newMax: number,
  clamp?: boolean
) {
  const clampMin = Math.min(newMin, newMax);
  const clampMax = Math.max(newMin, newMax);
  return (input: number) => {
    const val = newMin + ((input - min) / (max - min)) * (newMax - newMin);
    if (clamp) {
      return Math.max(clampMin, Math.min(clampMax, val));
    } else {
      return val;
    }
  };
}

// clamps by default
export function lerp(x: number, y: number, t: number) {
  return (y - x) * t + x;
}

export function splitArray<T, R extends T>(
  blah: T[],
  predicate: (e: T) => e is R
): { matching: R[]; notMatching: T[] } {
  const matching: R[] = [];
  const notMatching: T[] = [];
  blah.forEach((element) => {
    if (predicate(element)) matching.push(element);
    else notMatching.push(element);
  });
  return { matching, notMatching };
}

export function messageToCallStack(message: string, errorMsg: string) {
  // split into 2-word pairs
  // from the back, create a function with that name,
  // have it call a function with name from previous in list
  // in the list
  const fNames = message
    .split(",")
    .map((x) => x.replaceAll(" ", "_").replaceAll("\n", ""));
  //

  function getFunctionString() {
    let str = "";

    fNames.forEach((f, i) => {
      if (i === 0) {
        str = `
        function ${f}() {
          console.error("${errorMsg}");
        }
        `;
      } else {
        str += `
        function ${f}() {
          ${fNames[i - 1]}();
        }
        `;
      }
    });
    return str + ` return ${fNames[fNames.length - 1]}();`;
  }
  const body = getFunctionString();
  const f = new Function(body);

  f();
}
