export async function report(blah, yadda) {
    while (blah().length < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log(`${yadda || ""}:`);
    console.log(blah());
}
export function vec3Sum(vecs) {
    return vecs.reduce((sum, p) => ({
        x: sum.x + p.x,
        y: sum.y + p.y,
        z: sum.z + p.z,
    }), { x: 0, y: 0, z: 0 });
}
export function remap(min, max, newMin, newMax, clamp) {
    const clampMin = Math.min(newMin, newMax);
    const clampMax = Math.max(newMin, newMax);
    return (input) => {
        const val = newMin + ((input - min) / (max - min)) * (newMax - newMin);
        if (clamp) {
            return Math.max(clampMin, Math.min(clampMax, val));
        }
        else {
            return val;
        }
    };
}
// clamps by default
export function lerp(x, y, t) {
    return (y - x) * t + x;
}
export function splitArray(blah, predicate) {
    const matching = [];
    const notMatching = [];
    blah.forEach((element) => {
        if (predicate(element))
            matching.push(element);
        else
            notMatching.push(element);
    });
    return { matching, notMatching };
}
export function messageToCallStack(message, errorMsg) {
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
            }
            else {
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
export function spiral({ angle, offset, center, }) {
    const r = remap(0, 256, 6, 100, true);
    function blah(i) {
        const p = r(i);
        const theta = (i % angle) + offset;
        return {
            x: center.x + Math.cos(theta) * p,
            y: 0,
            z: center.z + Math.sin(theta) * p,
        };
    }
    return blah;
}
export function grid({ start, end, numPerRow, numPerColumn, }) {
    const rowSize = end.x - start.x;
    const colSize = end.z - start.z;
    const w = rowSize / numPerRow;
    const h = colSize / numPerColumn;
    function blah(i) {
        const row = Math.floor(i / numPerRow);
        const col = i % numPerRow;
        return {
            x: start.x + col * w,
            y: 0,
            z: start.z + row * h,
        };
    }
    return blah;
}
