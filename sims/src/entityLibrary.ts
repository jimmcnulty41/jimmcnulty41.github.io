import { Entity } from "./Entity.js";
import { getAge } from "./components/AgeComponent.js";
import { AngleAxisRotationComponent } from "./components/RotationComponent.js";
import { getMetadata } from "./data/data_9.js";
import { getLerpToPosComponent } from "./systems/calcTransformSystem.js";
import { getRandomImageName } from "./systems/three_wrappers/loadImages.js";
import { grid, remap, spiral } from "./utils.js";

const s = spiral({
  angle: Math.PI,
  offset: Math.PI,
  center: { x: 0, y: 5, z: 0 },
});

function sketchbook_page_in_spiral(id: string): Entity {
  const internalRoll = Math.random();
  const internalRoll3 = Math.random();

  const i = Number.parseInt(id);
  const target1 = s(i);
  const imageName = getRandomImageName();
  const m = getMetadata(imageName);
  return {
    id,
    components: {
      color: { r: 1, g: 1, b: 1 },
      age: {},
      initRender: {
        refName: "sketchbook_page",
        pageName: imageName,
      },
      metadata: {
        tags: m.tags,
      },
      position: {
        x: 0,
        y: internalRoll3 * 4,
        z: 0,
      },
      rotation: {
        style: "angle axis",
        amt: 0,
        axis: 1,
      },
      scale: {
        amt: 0,
      },
      calculateScale: {
        calculation: (m, e) => {
          const t = e.components.age
            ? getAge(m.time, e.components.age)
            : m.time;
          return remap(0, 100, 0, 1, true)(t);
        },
      },
      calculateRotation: {
        calculation: (m, e) => {
          const t =
            m.input.entityUnderMouse === e.id ? m.time / 2 : m.time / 12;
          return (
            (e.components.rotation as AngleAxisRotationComponent).amt +
            Math.sin(t + internalRoll * 100) / 100
          );
        },
      },
      calculatePosition: [
        getLerpToPosComponent(target1),
        {
          calculation: (m, e) => {
            const { position } = e.components;
            return { y: m.input.entityUnderMouse === e.id ? 4 : 0 };
          },
        },
      ],
    },
  };
}

function sketchbook_page_in_grid(g: Function) {
  function sketchbook_page_in_grid(id: string): Entity {
    const internalRoll = Math.random();
    const internalRoll3 = Math.random();

    const i = Number.parseInt(id);
    const target1 = g(i);
    const imageName = getRandomImageName();
    const m = getMetadata(imageName);
    return {
      id,
      components: {
        color: { r: 1, g: 1, b: 1 },
        age: {},
        initRender: {
          refName: "sketchbook_page",
          pageName: imageName,
        },
        metadata: {
          tags: m.tags,
        },
        position: {
          x: 0,
          y: internalRoll3 * 4,
          z: 0,
        },
        rotation: {
          style: "angle axis",
          amt: 0,
          axis: 1,
        },
        scale: {
          amt: 0,
        },
        calculateScale: {
          calculation: (m, e) => {
            const t = e.components.age
              ? getAge(m.time, e.components.age)
              : m.time;
            return remap(0, 100, 0, 1, true)(t);
          },
        },
        calculateRotation: {
          calculation: (m, e) => {
            const t =
              m.input.entityUnderMouse === e.id ? m.time / 2 : m.time / 12;
            return (
              (e.components.rotation as AngleAxisRotationComponent).amt +
              Math.sin(t + internalRoll * 100) / 100
            );
          },
        },
        calculatePosition: [
          getLerpToPosComponent(target1),
          {
            calculation: (m, e) => {
              const { position } = e.components;
              return { y: m.input.entityUnderMouse === e.id ? 4 : 0 };
            },
          },
        ],
      },
    };
  }
  return sketchbook_page_in_grid;
}
export { sketchbook_page_in_spiral };
