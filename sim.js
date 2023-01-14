// THREE imported from html

let scene = new THREE.Scene();
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas });

renderer.setSize(window.innerWidth, window.innerHeight);
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);

function start() {
  update();
}

function createObject({ type }) {
  switch (type) {
    case "sphere":
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      return mesh;
  }
}

function updateScene() {}

let model = {
  time: 0,
  entities: [],
  idCounter: 0,
  sceneMapping: {},
};

let systems = {
  advanceTimeSystem: (model) => ({
    ...model,
    time: model.time + 1,
  }),
  addEntityEveryNTicks: (model) =>
    model.time % 3 || model.entities.length > 1000
      ? model
      : {
          ...model,
          entities: [...model.entities, newDefaultEntity(`${model.idCounter}`)],
          idCounter: model.idCounter + 1,
        },
  wander: (model) => {
    return {
      ...model,
      entities: model.entities.map((e, i) => {
        if (!e.components.wander) return e;

        const roll = Math.random();

        const c = e.components.wander;
        const p = e.components.position;

        const distances = [
          Math.abs(c.x - roll),
          Math.abs(c.y - roll),
          Math.abs(c.z - roll),
        ];

        const dir =
          distances[0] < distances[1] && distances[0] < distances[2]
            ? 0
            : distances[1] < distances[0] && distances[1] < distances[2]
            ? 1
            : 2;
        const sign = [p.x, p.y, p.z][dir] > c.sign * 50 ? -1 : 12;

        return {
          ...e,
          components: {
            ...e.components,
            position: {
              x: p.x + Number(dir === 0) * sign,
              y: p.y + Number(dir === 1) * sign,
              z: p.z + Number(dir === 2) * sign,
            },
          },
        };
      }),
    };
  },
  report: (model) => {
    const positions = model.entities
      .filter((e) => e.components.position)
      .map((e) => e.components.position);

    const posSum = positions.reduce(
      (sum, p) => ({
        x: sum.x + p.x,
        y: sum.y + p.y,
        z: sum.z + p.z,
      }),
      { x: 0, y: 0, z: 0 }
    );

    console.log(
      `${(posSum.x / positions.length).toFixed(2)} ${(
        posSum.y / positions.length
      ).toFixed(2)} ${(posSum.z / positions.length).toFixed(2)}`
    );
    return model;
  },
  updateTHREEScene: (model) => {
    const sceneMapping = { ...model.sceneMapping };

    model.entities.forEach((e) => {
      if (e.components.render === undefined) {
        return;
      }
      if (!sceneMapping[e.id]) {
        // instance in scene
        const object = createObject(e.components.render);
        scene.add(object);
        sceneMapping[e.id] = object.id;
      } else {
        const childIdx = scene.children.findIndex(
          (c) => c.id === sceneMapping[e.id]
        );
        scene.children[childIdx].position.set(
          e.components.position.x,
          e.components.position.y,
          e.components.position.z
        );
      }
    });

    return {
      ...model,
      sceneMapping,
    };
  },
};

function newDefaultEntity(id) {
  return {
    id,
    components: {
      render: { type: "sphere" },
      position: { x: 0, y: 0, z: 0 },
      wander: {
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        sign: Math.pow(Math.random(), 12),
      },
    },
  };
}

function update() {
  window.requestAnimationFrame(() => update());

  Object.keys(systems).forEach((s) => {
    model = systems[s](model);
  });

  updateScene();

  renderer.render(scene, camera);
}

start();
