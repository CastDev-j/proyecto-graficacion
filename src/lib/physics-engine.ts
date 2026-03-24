import { expm, multiply, subtract, inv, matrix, add, identity } from "mathjs";
import type { SystemParams, StateVector, ForceConfig } from "./store";
import { SIMULATION_CONSTANTS } from "./constants";

const {
  SCALE,
  HALF_MASS,
  WALL_X,
  WALL_THICKNESS,
  BASE_POSITIONS,
  K_CONTACT,
  C_CONTACT,
  SUB_STEPS,
} = SIMULATION_CONSTANTS;

const WALL_EDGE = WALL_X + WALL_THICKNESS;

export function rk4Step(
  state: StateVector,
  params: SystemParams,
  force: (t: number) => number,
  dt: number,
  t: number
): StateVector {
  // Sub-stepping para estabilidad numérica en colisiones
  const subDt = dt / SUB_STEPS;
  let currentState = state;
  let currentTime = t;

  for (let i = 0; i < SUB_STEPS; i++) {
    const k1 = derivatives(currentState, params, force(currentTime));
    const k2 = derivatives(
      addStates(currentState, scaleState(k1, subDt / 2)),
      params,
      force(currentTime + subDt / 2)
    );
    const k3 = derivatives(
      addStates(currentState, scaleState(k2, subDt / 2)),
      params,
      force(currentTime + subDt / 2)
    );
    const k4 = derivatives(
      addStates(currentState, scaleState(k3, subDt)),
      params,
      force(currentTime + subDt)
    );

    const k = {
      x1: (k1.x1 + 2 * k2.x1 + 2 * k3.x1 + k4.x1) / 6,
      v1: (k1.v1 + 2 * k2.v1 + 2 * k3.v1 + k4.v1) / 6,
      x2: (k1.x2 + 2 * k2.x2 + 2 * k3.x2 + k4.x2) / 6,
      v2: (k1.v2 + 2 * k2.v2 + 2 * k3.v2 + k4.v2) / 6,
      x3: (k1.x3 + 2 * k2.x3 + 2 * k3.x3 + k4.x3) / 6,
      v3: (k1.v3 + 2 * k2.v3 + 2 * k3.v3 + k4.v3) / 6,
    };

    currentState = addStates(currentState, scaleState(k, subDt));
    currentTime += subDt;
  }

  return currentState;
}

function derivatives(
  state: StateVector,
  params: SystemParams,
  F: number
): StateVector {
  const { masses, springs, dampers } = params;
  const { x1, v1, x2, v2, x3, v3 } = state;

  const [m1, m2, m3] = masses;
  const [k1, k2, k3] = springs;
  const [c1, c2, c3] = dampers;

  // Fuerzas básicas de resortes y amortiguadores
  let f1 = -k1 * x1 - c1 * v1 + k2 * (x2 - x1) + c2 * (v2 - v1) + F;
  let f2 = -k2 * (x2 - x1) - c2 * (v2 - v1) + k3 * (x3 - x2) + c3 * (v3 - v2);
  let f3 = -k3 * (x3 - x2) - c3 * (v3 - v2);

  // --- LÓGICA DE COLISIONES ---
  
  // Posiciones en el mundo (World Space)
  const mw1 = BASE_POSITIONS[0] + x1 * SCALE;
  const mw2 = BASE_POSITIONS[1] + x2 * SCALE;
  const mw3 = BASE_POSITIONS[2] + x3 * SCALE;

  // 1. Masa 1 vs Pared
  const distWall = (mw1 - HALF_MASS) - WALL_EDGE;
  if (distWall < 0) {
    // Fuerza de repulsión hacia la derecha (+)
    f1 += (-K_CONTACT * distWall - C_CONTACT * v1) / SCALE;
  }

  // 2. Masa 1 vs Masa 2
  const dist12 = (mw2 - HALF_MASS) - (mw1 + HALF_MASS);
  if (dist12 < 0) {
    const vRel = v2 - v1;
    const repForce = -K_CONTACT * dist12 - C_CONTACT * vRel;
    f1 -= repForce / SCALE; // Empuja m1 a la izquierda
    f2 += repForce / SCALE; // Empuja m2 a la derecha
  }

  // 3. Masa 2 vs Masa 3
  const dist23 = (mw3 - HALF_MASS) - (mw2 + HALF_MASS);
  if (dist23 < 0) {
    const vRel = v3 - v2;
    const repForce = -K_CONTACT * dist23 - C_CONTACT * vRel;
    f2 -= repForce / SCALE;
    f3 += repForce / SCALE;
  }

  return {
    x1: v1,
    v1: f1 / m1,
    x2: v2,
    v2: f2 / m2,
    x3: v3,
    v3: f3 / m3,
  };
}

function addStates(s1: StateVector, s2: StateVector): StateVector {
  return {
    x1: s1.x1 + s2.x1,
    v1: s1.v1 + s2.v1,
    x2: s1.x2 + s2.x2,
    v2: s1.v2 + s2.v2,
    x3: s1.x3 + s2.x3,
    v3: s1.v3 + s2.v3,
  };
}

function scaleState(s: StateVector, scale: number): StateVector {
  return {
    x1: s.x1 * scale,
    v1: s.v1 * scale,
    x2: s.x2 * scale,
    v2: s.v2 * scale,
    x3: s.x3 * scale,
    v3: s.v3 * scale,
  };
}

export function getForceFunction(config: ForceConfig): (t: number) => number {
  const { type, amplitude, frequency, offset } = config;
  const omega = 2 * Math.PI * frequency;

  switch (type) {
    case "step":
      return (t: number) => (t >= offset ? amplitude : 0);
    case "sine":
      return (t: number) => amplitude * Math.sin(omega * (t - offset));
    case "sawtooth":
      return (t: number) => {
        const phase = ((t - offset) * frequency) % 1;
        return amplitude * (2 * phase - 1);
      };
    case "square":
      return (t: number) => {
        const phase = ((t - offset) * frequency) % 1;
        return amplitude * (phase < 0.5 ? 1 : -1);
      };
    case "triangle":
      return (t: number) => {
        const phase = ((t - offset) * frequency) % 1;
        return amplitude * (phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase);
      };
    default:
      return () => 0;
  }
}

// Analítica por Transformada de Laplace para fuerza escalón
export function laplaceStep(
  params: SystemParams,
  force: ForceConfig,
  t: number
): StateVector {
  if (force.type !== "step") {
    return { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 };
  }
  const { amplitude, offset } = force;
  if (t < offset) {
    return { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 };
  }
  const tau = t - offset;

  const [m1, m2, m3] = params.masses;
  const [k1, k2, k3] = params.springs;
  const [c1, c2, c3] = params.dampers;

  const A: number[][] = [
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1],
    [(-k1 - k2) / m1, k2 / m1, 0, (-c1 - c2) / m1, c2 / m1, 0],
    [k2 / m2, -(k2 + k3) / m2, k3 / m2, c2 / m2, -(c2 + c3) / m2, c3 / m2],
    [0, k3 / m3, -k3 / m3, 0, c3 / m3, -c3 / m3],
  ];

  const B: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [1 / m1, 0, 0],
    [0, 1 / m2, 0],
    [0, 1 / m3, 0],
  ];

  const Fvec = [amplitude, 0, 0];
  const A_mat = matrix(A);
  const B_mat = matrix(B);
  const F_mat = matrix([[Fvec[0]], [Fvec[1]], [Fvec[2]]]);

  let E;
  try {
    E = expm(multiply(A_mat, tau));
  } catch {
    const I = identity(6);
    let term = I;
    let result = I;
    const Mtau = multiply(A_mat, tau);
    for (let k = 1; k <= 18; k++) {
      term = multiply(term, Mtau);
      term = multiply(term, 1 / k);
      result = add(result, term);
    }
    E = result;
  }

  const I6 = identity(6);
  const A_inv = inv(A_mat);
  const Bf = multiply(B_mat, F_mat);
  const diff = subtract(E, I6);
  const s_tau = multiply(multiply(A_inv, diff), Bf);
  const arr = (s_tau as any).toArray().map((row: number[]) => row[0]);

  return {
    x1: arr[0],
    x2: arr[1],
    x3: arr[2],
    v1: arr[3],
    v2: arr[4],
    v3: arr[5],
  };
}
