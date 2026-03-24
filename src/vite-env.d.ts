/// <reference types="vite/client" />

declare module "*.vertex.glsl?raw" {
  const content: string;
  export default content;
}

declare module "*.fragment.glsl?raw" {
  const content: string;
  export default content;
}

declare module "*.glsl?raw" {
  const content: string;
  export default content;
}
