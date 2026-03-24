// Constantes compartidas entre la física y la visualización 3D

export const SIMULATION_CONSTANTS = {
  // Geometría
  SCALE: 0.9,
  HALF_MASS: 0.6,
  WALL_X: -4.2,
  WALL_THICKNESS: 0.25,
  BASE_POSITIONS: [-2.5, 0, 2.5] as [number, number, number],
  
  // Contacto (Penalización)
  K_CONTACT: 5000,
  C_CONTACT: 100,
  
  // Integración
  SUB_STEPS: 15, // Aumentado para mayor precisión en no-linealidad
  DATA_SAMPLE_INTERVAL: 0.03,
  MAX_DATA_POINTS: 1500,

  // --- NUEVOS PARÁMETROS DE REALISMO ---
  // Coeficiente de endurecimiento no lineal (Hardening)
  // F = k * dx * (1 + beta * dx^2)
  HARDENING_COEFFICIENT: 2.0,
  
  // Amortiguamiento por defecto (Razón de amortiguamiento zeta)
  // zeta < 1: subamortiguado, 1: crítico, > 1: sobreamortiguado
  DEFAULT_ZETA: 0.05, 
};
