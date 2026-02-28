import type { SystemParams, StateVector, ForceConfig } from "./store";
import { expm, multiply, subtract, inv, matrix, add, identity } from "mathjs";

export function rk4Step(
  state: StateVector,
  params: SystemParams,
  force: (t: number) => number,
  dt: number,
  t: number
): StateVector {
  const k1 = derivatives(state, params, force(t));
  const k2 = derivatives(
    addStates(state, scaleState(k1, dt / 2)),
    params,
    force(t + dt / 2)
  );
  const k3 = derivatives(
    addStates(state, scaleState(k2, dt / 2)),
    params,
    force(t + dt / 2)
  );
  const k4 = derivatives(
    addStates(state, scaleState(k3, dt)),
    params,
    force(t + dt)
  );

  const k = {
    x1: (k1.x1 + 2 * k2.x1 + 2 * k3.x1 + k4.x1) / 6,
    v1: (k1.v1 + 2 * k2.v1 + 2 * k3.v1 + k4.v1) / 6,
    x2: (k1.x2 + 2 * k2.x2 + 2 * k3.x2 + k4.x2) / 6,
    v2: (k1.v2 + 2 * k2.v2 + 2 * k3.v2 + k4.v2) / 6,
    x3: (k1.x3 + 2 * k2.x3 + 2 * k3.x3 + k4.x3) / 6,
    v3: (k1.v3 + 2 * k2.v3 + 2 * k3.v3 + k4.v3) / 6,
  };

  return addStates(state, scaleState(k, dt));
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

  const a1 = (-k1 * x1 - c1 * v1 + k2 * (x2 - x1) + c2 * (v2 - v1) + F) / m1;
  const a2 =
    (-k2 * (x2 - x1) - c2 * (v2 - v1) + k3 * (x3 - x2) + c3 * (v3 - v2)) / m2;
  const a3 = (-k3 * (x3 - x2) - c3 * (v3 - v2)) / m3;

  return {
    x1: v1,
    v1: a1,
    x2: v2,
    v2: a2,
    x3: v3,
    v3: a3,
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

export function computeFourierCoefficients(
  type: "sawtooth" | "square" | "triangle",
  amplitude: number,
  nTerms: number
): { a0: number; an: number[]; bn: number[] } {
  const an: number[] = [];
  const bn: number[] = [];

  switch (type) {
    case "sawtooth":
      for (let n = 1; n <= nTerms; n++) {
        an.push(0);
        bn.push(-(amplitude / (Math.PI * n)));
      }
      return { a0: amplitude / 2, an, bn };

    case "square":
      for (let n = 1; n <= nTerms; n++) {
        an.push(0);
        bn.push(n % 2 === 1 ? (4 * amplitude) / (Math.PI * n) : 0);
      }
      return { a0: 0, an, bn };

    case "triangle":
      for (let n = 1; n <= nTerms; n++) {
        an.push(0);
        const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
        bn.push(
          n % 2 === 1 ? (8 * amplitude * sign) / (Math.PI * Math.PI * n * n) : 0
        );
      }
      return { a0: 0, an, bn };

    default:
      return { a0: 0, an: [], bn: [] };
  }
}

export function computeNaturalFrequencies(params: SystemParams): number[] {
  const { masses, springs } = params;
  const [m1, m2, m3] = masses;
  const [k1, k2, k3] = springs;

  const omega1 = Math.sqrt(k1 / m1);
  const omega2 = Math.sqrt((k1 + k2) / m2);
  const omega3 = Math.sqrt((k2 + k3) / m3);

  return [omega1, omega2, omega3].sort((a, b) => a - b);
}

// Analítica por Transformada de Laplace para fuerza escalón
// Resuelve el sistema lineal M x'' + C x' + K x = F aplicando fuerza al primer nodo.
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

  // Matriz dinámica del sistema en forma de primer orden: s' = A s + B F
  // s = [x1,x2,x3,v1,v2,v3]^T
  const A: number[][] = [
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1],
    [(-k1 - k2) / m1, k2 / m1, 0, (-c1 - c2) / m1, c2 / m1, 0],
    [k2 / m2, -(k2 + k3) / m2, k3 / m2, c2 / m2, -(c2 + c3) / m2, c3 / m2],
    [0, k3 / m3, -k3 / m3, 0, c3 / m3, -c3 / m3],
  ];

  // B mapea fuerzas sobre masas a aceleraciones (solo usamos primera masa)
  const B: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [1 / m1, 0, 0],
    [0, 1 / m2, 0],
    [0, 0, 1 / m3],
  ];

  // Vector de fuerza (solo componente en masa 1)
  const Fvec = [amplitude, 0, 0];

  const A_mat = matrix(A);
  const B_mat = matrix(B);
  const F_mat = matrix([[Fvec[0]], [Fvec[1]], [Fvec[2]]]);

  // e^{A tau}
  let E;
  try {
    E = expm(multiply(A_mat, tau));
  } catch {
    // Fallback simple serie si expm no disponible
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
  const Bf = multiply(B_mat, F_mat); // 6x1
  // s(tau) = A^{-1}(e^{A tau} - I) B F (estado inicial cero)
  const diff = subtract(E, I6);
  const s_tau = multiply(multiply(A_inv, diff), Bf); // 6x1 vector
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
