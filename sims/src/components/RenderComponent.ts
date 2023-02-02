export type RenderComponent =
  | StandardRenderComponent
  | InstancedRenderComponent;

export interface StandardRenderComponent {
  refName: string;
  id: number;
  type: "standard";
}
export interface InstancedRenderComponent {
  refName: string;
  id: number;
  type: "instanced";
}
