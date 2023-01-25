import { Color, DynamicDrawUsage, GridHelper, IcosahedronGeometry, InstancedMesh, Matrix4, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer, Euler, HemisphereLight, MeshLambertMaterial, sRGBEncoding, DoubleSide, } from "../vendor/three.js";
import { mergeBufferGeometries } from "../vendor/BufferGeometryUtils.js";
import { GLTFLoader } from "../vendor/GLTFLoader.js";
import { OrbitControls } from "../vendor/OrbitControls.js";
import { hasRotation, isRenderable, isRenderableGrid, isRenderableModel, isRenderableSphere, } from "../components/Components.js";
import { PlaneGeometry } from "../vendor/three.js";
import { rots } from "../components/RotationComponent.js";
const eulers = rots.map((r) => new Euler(r[0], r[1], r[2]));
let entityIdToSceneChild = {};
let entityIdToInstanceId = {};
let scene = new Scene();
const canvas = document.querySelector("canvas");
if (!canvas)
    throw new Error("canvas not found on page");
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = sRGBEncoding;
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(100, 100, 100);
camera.lookAt(0, 0, 0);
const orbitControls = new OrbitControls(camera, canvas);
const GLTFs = await loadModels();
const instanceMeshes = {
    sphere: {
        inst: getInstancedSphere(),
        idCounter: 0,
        registers: {
            matrix: new Matrix4(),
            color: new Color(1, 0, 0.5),
        },
    },
    rat: {
        inst: getInstancedModel(),
        idCounter: 0,
        registers: {
            matrix: new Matrix4(),
            color: new Color(1, 0, 0.5),
        },
    },
    plane: {
        inst: getInstancedPlane(),
        idCounter: 0,
        registers: {
            matrix: new Matrix4(),
            color: new Color(1, 0, 0.5),
        },
    },
};
Object.keys(instanceMeshes).forEach((k) => {
    scene.add(instanceMeshes[k].inst);
});
scene.add(new HemisphereLight(0xffffff, 0xff0033, 1));
function getInstancedSphere() {
    const instancedMesh = new InstancedMesh(new IcosahedronGeometry(10, 3), new MeshBasicMaterial({ color: 0xffffff }), 10000);
    instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
    instancedMesh.count = 0;
    return instancedMesh;
}
function groupToBuffer(group) {
    const meshes = [];
    group.traverse((c) => {
        if (c.isMesh) {
            meshes.push(c);
        }
    });
    const geos = meshes.map((m) => m.geometry);
    const bufferGeometry = mergeBufferGeometries(geos);
    return bufferGeometry;
}
function getInstancedModel() {
    const geo = groupToBuffer(GLTFs["rat"].scene);
    geo.computeVertexNormals();
    geo.scale(2, 2, 2);
    const instancedMesh = new InstancedMesh(geo, new MeshLambertMaterial({ color: 0xff00ff }), 10000);
    instancedMesh.instanceMatrix.setUsage(DynamicDrawUsage); // will be updated every frame
    instancedMesh.count = 0;
    return instancedMesh;
}
async function loadModels() {
    const gltfPaths = [
        {
            path: "/assets/models/rat_2.2.gltf",
            refName: "rat",
        },
    ];
    const gltfLoader = new GLTFLoader();
    return (await Promise.all(gltfPaths.map(async ({ path, refName, }) => ({
        model: await gltfLoader.loadAsync(path),
        refName,
    })))).reduce((memo, x) => ({
        ...memo,
        [x.refName]: x.model,
    }), {});
}
function getInstancedPlane() {
    const geo = new PlaneGeometry(12, 7, 2, 2);
    geo.rotateX(Math.PI / 2);
    geo.rotateY(Math.PI / 2);
    const instancedMesh = new InstancedMesh(geo, new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide }), 10000);
    instancedMesh.count = 0;
    return instancedMesh;
}
function updateSphere(sphereEntity) {
    return instancedUpdate(sphereEntity, "sphere");
}
function instancedUpdate(entity, instanceKey) {
    const id = entityIdToInstanceId[entity.id];
    const { inst, idCounter, registers: { matrix, color }, } = instanceMeshes[instanceKey];
    matrix.identity();
    if (id === undefined) {
        matrix.setPosition(0, 0, 0);
        if (hasRotation(entity)) {
            matrix.makeRotationFromEuler(eulers[entity.components.rotation.dix]);
        }
        inst.setMatrixAt(idCounter, matrix);
        const newCount = idCounter + 1;
        entityIdToInstanceId[entity.id] = idCounter;
        instanceMeshes[instanceKey].idCounter = newCount;
        instanceMeshes[instanceKey].inst.count = newCount;
    }
    else {
        if (hasRotation(entity)) {
            matrix.makeRotationFromEuler(eulers[entity.components.rotation.dix]);
        }
        const { x, y, z } = entity.components.position;
        matrix.setPosition(x, y, z);
        inst.setMatrixAt(id, matrix);
    }
}
function update3DModel(value) {
    return instancedUpdate(value, value.components.render.refName);
}
function basicUpdate(entity, createObjFn) {
    const id = entityIdToSceneChild[entity.id];
    if (id === undefined) {
        const o = createObjFn();
        scene.add(o);
        entityIdToSceneChild[entity.id] = o.id;
    }
    else {
        const childIdx = scene.children.findIndex((c) => c.id === entityIdToSceneChild[entity.id]);
        scene.children[childIdx].position.set(entity.components.position.x, entity.components.position.y, entity.components.position.z);
    }
}
function updateGrid(gridEntity) {
    basicUpdate(gridEntity, () => new GridHelper(100, 10, 0xff0000));
}
export function updateTHREEScene(model) {
    const renderables = model.entities.filter(isRenderable);
    renderables.filter(isRenderableSphere).forEach(updateSphere);
    renderables.filter(isRenderableGrid).forEach(updateGrid);
    renderables.filter(isRenderableModel).forEach(update3DModel);
    Object.keys(instanceMeshes).forEach((k) => {
        setInstUpdate(instanceMeshes[k].inst);
    });
    orbitControls.update();
    renderer.render(scene, camera);
    return {
        ...model,
    };
}
function setInstUpdate(inst) {
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) {
        inst.instanceColor.needsUpdate = true;
    }
}
