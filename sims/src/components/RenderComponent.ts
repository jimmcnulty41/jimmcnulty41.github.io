export type RenderComponent =
  | SphereRenderComponent
  | GridRenderComponent
  | GLTFRenderComponent;

export type RenderTypes = "sphere" | "grid" | "3d model";

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
