export type RenderComponent =
  | SphereRenderComponent
  | GridRenderComponent
  | GLTFRenderComponent;

export type SupportSceneParent = GridRenderComponent;
export type SupportInstance = SphereRenderComponent | GLTFRenderComponent;

export interface SphereRenderComponent {
  type: "sphere";
}
export interface GridRenderComponent {
  type: "grid";
}
export interface GLTFRenderComponent {
  type: "3d model";
  refName: string;
}
