// Constantes compartidas entre la física y la visualización 3D

export const SIMULATION_CONSTANTS = {
  // Geometría
  SCALE: 0.9,
  HALF_MASS: 0.6,
  WALL_X: -4.2,
  WALL_THICKNESS: 0.25,
  BASE_POSITIONS: [-2.5, 0, 2.5] as [number, number, number],
  
  // Contacto (Penalización)
  K_CONTACT: 2500,
  C_CONTACT: 40,
  
  // Integración
  SUB_STEPS: 10,
  DATA_SAMPLE_INTERVAL: 0.03,
  MAX_DATA_POINTS: 1500,
};
