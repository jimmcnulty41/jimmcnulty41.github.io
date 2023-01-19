export type RenderComponent = SphereRenderComponent | GridRenderComponent;

export interface SphereRenderComponent {
  type: "sphere";
}
export interface GridRenderComponent {
  type: "grid";
}
