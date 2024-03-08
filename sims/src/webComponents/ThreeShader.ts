// Ensure you have the three.js types for TypeScript
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "../vendor/three.js";

class THREEShader extends HTMLElement {
  private container: HTMLElement | null = null;
  private camera: OrthographicCamera;
  private scene: Scene;
  private renderer: WebGLRenderer;
  private uniforms: { [uniform: string]: { type: string; value: any } };

  private lastTime: number = 0.0;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const canvas = document.createElement("canvas");
    canvas.style.setProperty("position", "fixed");
    canvas.style.setProperty("z-index", "1000");
    canvas.style.setProperty("pointer-events", "none");
    shadow.appendChild(canvas);
    this.container = canvas;

    const camera = new OrthographicCamera();
    this.camera = camera;
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ canvas, alpha: true });
    this.renderer.setClearColor(new Color(0, 0, 0), 0);
    this.uniforms = {
      u_time: { type: "f", value: 1.0 },
      u_resolution: { type: "v2", value: new Vector2() },
      u_mouse: { type: "v2", value: new Vector2() },
    };
  }

  connectedCallback() {
    this.init();
    this.render(0);
  }

  private init(): void {
    this.container = this.querySelector("#container");

    this.camera.position.set(0, 0, 1);

    const geometry = new PlaneGeometry(2, 2);

    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader:
        (document.getElementById("vertexShader") as HTMLScriptElement)
          .textContent || "",
      fragmentShader:
        (document.getElementById("fragmentShader") as HTMLScriptElement)
          .textContent || "",
    });

    const mesh = new Mesh(geometry, material);
    this.scene.add(mesh);

    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.container?.appendChild(this.renderer.domElement);

    this.onWindowResize();
    window.addEventListener("resize", () => this.onWindowResize(), false);

    document.onmousemove = (e) => {
      this.uniforms.u_mouse.value.x = e.pageX;
      this.uniforms.u_mouse.value.y = e.pageY;
    };
  }

  private onWindowResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
    this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
  }

  private render(time: number): void {
    let delta = time - this.lastTime;
    this.lastTime = time;
    this.uniforms.u_time.value += delta;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((t) => this.render(t));
  }
}

customElements.define("three-shader", THREEShader);
