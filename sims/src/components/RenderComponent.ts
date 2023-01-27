export type RenderComponent =
  | SphereRenderComponent
  | GridRenderComponent
  | InstancedGLTFRenderComponent
  | GLTFRenderComponent
  | never;

export type SupportSceneParent = GridRenderComponent | GLTFRenderComponent;
export type SupportInstance =
  | SphereRenderComponent
  | InstancedGLTFRenderComponent;

export interface SphereRenderComponent {
  type: "sphere";
}
export interface GridRenderComponent {
  type: "grid";
}
export interface InstancedGLTFRenderComponent {
  type: "instanced 3d model";
  refName: string;
}

export interface GLTFRenderComponent {
  type: "3d model";
  refName: string;
  objectName?: string;
}
