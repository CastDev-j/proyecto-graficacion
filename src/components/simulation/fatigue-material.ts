import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, type ThreeElement } from "@react-three/fiber";

// Importar shaders como strings (Vite ?raw)
import vertexShader from "./shaders/fatigue.vertex.glsl?raw";
import fragmentShader from "./shaders/fatigue.fragment.glsl?raw";

export const FatigueMaterial = shaderMaterial(
  {
    uStress: 0,
    uBaseColor: new THREE.Color("#8b5cf6"),
    uFatigueColor: new THREE.Color("#ff0000"),
  },
  vertexShader,
  fragmentShader
);

// Registrar el material para que JSX lo reconozca
extend({ FatigueMaterial });

// Definir tipos para JSX
declare module "@react-three/fiber" {
  interface ThreeElements {
    fatigueMaterial: ThreeElement<typeof FatigueMaterial>;
  }
}
