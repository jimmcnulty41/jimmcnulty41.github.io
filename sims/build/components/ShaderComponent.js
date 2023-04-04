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
};
