export interface ShaderComponent {
  key: keyof typeof SHADERS;
}

export const SHADERS = {
  default: {
    vert: `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,
    frag: `
    uniform vec3 color;
    void main() {
        gl_FragColor = vec4(color, 1.0);
      }
      `,
  },
  wrapAroundPoint: {
    vert: `
        void main() {
            float dist = length(position.x);
            float angle = dist/2.;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(sin(angle), position.y, cos(angle), 1.0);
        }
        `,
    frag: `
    uniform vec3 color;
    void main() {
        gl_FragColor = vec4(color, 1.0);
      }
      `,
  },
};
