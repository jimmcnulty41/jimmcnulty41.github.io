import { Entity } from "../../Entity.js";
import {
  DynamicDrawUsage,
  BufferGeometry,
  InstancedMesh,
  GridHelper,
  Vector3,
  Line,
  MeshLambertMaterial,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SphereGeometry,
  LineBasicMaterial,
  CircleGeometry,
  ShaderMaterial,
} from "../../vendor/three.js";
import { TextGeometry } from "../../vendor/TextGeometry.js";
import { Font, FontLoader } from "../../vendor/FontLoader.js";
import { ResolvedTHREEManager } from "./THREEManager.js";
import {
  getBufferGeometryFromGLTF,
  getMeshFromGLTF,
  loadGLTFsInBg,
} from "./loadGLTFs.js";
import { getTextureByName } from "./loadImages.js";
import { instanceIdToEntityId, registers } from "./threeOptimizations.js";
import { InitTextRenderComponent } from "../../components/RenderComponent.js";

const f = new FontLoader();
let font: Font;
f.load("/assets/fonts/gentilis_bold.typeface.json", (res) => (font = res));

interface InstanceBookkeeping {
  inst: InstancedMesh;
  idCounter: number;
}
export type InstanceMeshes = { [name: string]: InstanceBookkeeping };

export const meshInitFuncs = {
  sphere: (tm: ResolvedTHREEManager) =>
    new Mesh(
      new SphereGeometry(1, 12, 12),
      new MeshBasicMaterial({ color: 0x4400ff })
    ),
  head_top: (tm: ResolvedTHREEManager) => tm.meshes["head_top"],
  head_bottom: (tm: ResolvedTHREEManager) => tm.meshes["head_bottom"],
  sketchbook_page: (tm: ResolvedTHREEManager, e: Entity) =>
    new Mesh(
      new PlaneGeometry(10, 12, 2, 2).rotateX(-Math.PI / 3),
      new MeshBasicMaterial({
        map: getTextureByName(e.components.initRender?.pageName || ""),
      })
    ),
  plane: (tm: ResolvedTHREEManager) =>
    new Mesh(
      new PlaneGeometry(10, 12, 2, 2),
      new MeshBasicMaterial({ color: 0xff00ff })
    ),
  grid: (tm: ResolvedTHREEManager) => new GridHelper(10, 10),
  line: (tm: ResolvedTHREEManager) => {
    return new Line(
      new BufferGeometry().setFromPoints([
        new Vector3(0, 0, 0),
        new Vector3(0, 10, 0),
      ]),
      new LineBasicMaterial({ color: 0x0000ff })
    );
  },
  circle: (tm: ResolvedTHREEManager) => {
    return new Mesh(
      new CircleGeometry(1.2, 12),
      new MeshBasicMaterial({ color: 0xaa33bb })
    );
  },
  text: (tm: ResolvedTHREEManager, e: Entity) => {
    const init = e.components.initRender as InitTextRenderComponent;
    const mat = e.components.shader
      ? new ShaderMaterial({})
      : new MeshBasicMaterial({ color: 0x2244ff });

    return new Mesh(
      new TextGeometry(init.text, { font, size: 1, height: 0.1 })
    );
  },
};
type InitFuncs = typeof meshInitFuncs;
export type RefNames = keyof InitFuncs;

loadGLTFsInBg([
  {
    path: "/assets/models/rat_2.2.gltf",
    refName: "rat",
    scale: [2, 2, 2],
  },
  {
    path: "/assets/models/self_portrait_2.gltf",
    refName: "head_top",
    objectNames: ["head_top", "head_bottom"],
    scale: [20, 20, 20],
  },
]);

export async function getInstanceMeshes(): Promise<InstanceMeshes> {
  return {
    sphere: {
      inst: await getInstancedMesh("sphere"),
      idCounter: 0,
    },
    rat: {
      inst: await getInstancedMesh("rat"),
      idCounter: 0,
    },
    plane: {
      inst: await getInstancedMesh("plane"),
      idCounter: 0,
    },
  };
}

export async function getMeshes(): Promise<{ [refName: string]: Mesh }> {
  return {
    head_top: await getMeshFromGLTF("head_top"),
    head_bottom: await getMeshFromGLTF("head_bottom"),
  };
}

async function getInstancedMesh(refName: string): Promise<InstancedMesh> {
  const geo = await getBufferGeometryFromGLTF(refName);
  const instancedMesh = new InstancedMesh(
    geo,
    new MeshLambertMaterial({ color: 0xff00ff }),
    10000
  );

  instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
  instancedMesh.count = 0;
  instancedMesh.name = refName;
  instanceIdToEntityId[instancedMesh.name] = {};

  instancedMesh.setColorAt(0, registers.color.setHex(0xffffff));
  if (instancedMesh.instanceColor === null) {
    throw new Error("instance color failed to instantiate");
  }
  instancedMesh.instanceColor.setUsage(DynamicDrawUsage); // will be updated every frame
  instancedMesh.instanceColor.needsUpdate = true;

  return instancedMesh;
}

export type Meshes = { [refName: string]: Mesh };
