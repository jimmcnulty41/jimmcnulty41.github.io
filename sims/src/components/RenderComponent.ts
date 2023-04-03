export type RenderComponent =
  | StandardRenderComponent
  | InstancedRenderComponent
  | LineRenderComponent;

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
export interface LineRenderComponent {
  refName: string;
  id: number;
  type: "line";
  from: number;
  to: number;
}
export interface InitRenderComponent {
  refName: string;
  pageName?: string;
}

export interface InitLineRenderComponent {
  refName: "line";
  pageName: undefined;
  from?: number;
  to?: number;
}

export interface InitTextRenderComponent {
  refName: "text";
  text: string;
  pageName: undefined;
}
