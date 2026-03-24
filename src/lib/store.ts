import { create } from "zustand";
import { SIMULATION_CONSTANTS } from "./constants";

const { DATA_SAMPLE_INTERVAL, MAX_DATA_POINTS } = SIMULATION_CONSTANTS;

export interface SystemParams {
  masses: [number, number, number];
  springs: [number, number, number];
  dampers: [number, number, number];
}

export interface ForceConfig {
  type: "step" | "sine" | "sawtooth" | "square" | "triangle";
  amplitude: number;
  frequency: number;
  offset: number;
}

export interface StateVector {
  x1: number;
  v1: number;
  x2: number;
  v2: number;
  x3: number;
  v3: number;
}

export interface SimulationData {
  time: number[];
  positions: { x1: number[]; x2: number[]; x3: number[] };
  velocities: { v1: number[]; v2: number[]; v3: number[] };
  energies: { kinetic: number[]; potential: number[]; total: number[] };
}


interface SimulationStore {
  parameters: SystemParams;
  force: ForceConfig;
  method: "numerical" | "laplace";

  activePreset: null | "underdamped" | "critical" | "overdamped" | "resonance";
  aiAnalysisToken: number; // incremented on input changes to clear AI analysis

  isRunning: boolean;
  currentTime: number;
  timeStep: number;
  speedMultiplier: number;

  simulationData: SimulationData;
  resultsSnapshot: SimulationData | null;
  resultsSnapshotTime: number | null;
  currentState: StateVector;

  setParameters: (params: Partial<SystemParams>) => void;
  setForce: (force: Partial<ForceConfig>) => void;
  setMethod: (method: "numerical" | "laplace") => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  setSpeedMultiplier: (speed: number) => void;
  updateSimulation: (newState: StateVector, time: number) => void;
  captureResultsSnapshot: () => void;
  clearResultsSnapshot: () => void;
  setSimulationData: (data: SimulationData) => void;
  loadPreset: (
    preset: "underdamped" | "critical" | "overdamped" | "resonance",
  ) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  parameters: {
    masses: [1.0, 1.0, 1.0],
    springs: [10.0, 10.0, 10.0],
    dampers: [0.5, 0.5, 0.5],
  },
  force: {
    type: "sine",
    amplitude: 5.0,
    frequency: 1.0,
    offset: 0,
  },
  method: "numerical",
  activePreset: null,
  aiAnalysisToken: 0,
  isRunning: false,
  currentTime: 0,
  timeStep: 0.01,
  speedMultiplier: 1.0,
  simulationData: {
    time: [],
    positions: { x1: [], x2: [], x3: [] },
    velocities: { v1: [], v2: [], v3: [] },
    energies: { kinetic: [], potential: [], total: [] },
  },
  resultsSnapshot: null,
  resultsSnapshotTime: null,
  currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },

  // Actions
  setParameters: (params) =>
    set((state) => ({
      parameters: { ...state.parameters, ...params },
      activePreset: null,
      simulationData: {
        time: [],
        positions: { x1: [], x2: [], x3: [] },
        velocities: { v1: [], v2: [], v3: [] },
        energies: { kinetic: [], potential: [], total: [] },
      },
      resultsSnapshot: null,
      resultsSnapshotTime: null,
      currentTime: 0,
      currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },
      aiAnalysisToken: state.aiAnalysisToken + 1,
    })),

  setForce: (force) =>
    set((state) => {
      const newForce = { ...state.force, ...force };
      // Si se cambia a un tipo que no es escalón, resetear a método numérico
      const newMethod = newForce.type !== "step" ? "numerical" : state.method;
      return {
        force: newForce,
        method: newMethod,
        simulationData: {
          time: [],
          positions: { x1: [], x2: [], x3: [] },
          velocities: { v1: [], v2: [], v3: [] },
          energies: { kinetic: [], potential: [], total: [] },
        },
        resultsSnapshot: null,
        resultsSnapshotTime: null,
        currentTime: 0,
        currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },
        aiAnalysisToken: state.aiAnalysisToken + 1,
      };
    }),

  setMethod: (method) =>
    set((state) => ({
      method,
      simulationData: {
        time: [],
        positions: { x1: [], x2: [], x3: [] },
        velocities: { v1: [], v2: [], v3: [] },
        energies: { kinetic: [], potential: [], total: [] },
      },
      resultsSnapshot: null,
      resultsSnapshotTime: null,
      currentTime: 0,
      currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },
      aiAnalysisToken: state.aiAnalysisToken + 1,
    })),

  startSimulation: () =>
    set({
      isRunning: true,
      resultsSnapshot: null,
      resultsSnapshotTime: null,
    }),
  stopSimulation: () =>
    set((state) => {
      const lastStoredTime =
        state.simulationData.time[state.simulationData.time.length - 1];
      const needStoreFinal = lastStoredTime !== state.currentTime;

      if (!needStoreFinal) {
        return { isRunning: false };
      }

      const { parameters } = state;
      const { masses, springs } = parameters;
      const { x1, x2, x3, v1, v2, v3 } = state.currentState;

      const kinetic =
        0.5 * (masses[0] * v1 * v1 + masses[1] * v2 * v2 + masses[2] * v3 * v3);
      const potential =
        0.5 *
        (springs[0] * x1 * x1 +
          springs[1] * (x2 - x1) * (x2 - x1) +
          springs[2] * (x3 - x2) * (x3 - x2));
      const total = kinetic + potential;

      return {
        isRunning: false,
        simulationData: {
          time: [...state.simulationData.time, state.currentTime],
          positions: {
            x1: [...state.simulationData.positions.x1, x1],
            x2: [...state.simulationData.positions.x2, x2],
            x3: [...state.simulationData.positions.x3, x3],
          },
          velocities: {
            v1: [...state.simulationData.velocities.v1, v1],
            v2: [...state.simulationData.velocities.v2, v2],
            v3: [...state.simulationData.velocities.v3, v3],
          },
          energies: {
            kinetic: [...state.simulationData.energies.kinetic, kinetic],
            potential: [...state.simulationData.energies.potential, potential],
            total: [...state.simulationData.energies.total, total],
          },
        },
      };
    }),

  resetSimulation: () =>
    set({
      isRunning: false,
      currentTime: 0,
      currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },
      simulationData: {
        time: [],
        positions: { x1: [], x2: [], x3: [] },
        velocities: { v1: [], v2: [], v3: [] },
        energies: { kinetic: [], potential: [], total: [] },
      },
      resultsSnapshot: null,
      resultsSnapshotTime: null,
      aiAnalysisToken: get().aiAnalysisToken + 1,
    }),

  setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),

  updateSimulation: (newState, time) => {
    const state = get();
    const lastStoredTime =
      state.simulationData.time[state.simulationData.time.length - 1];
    const shouldStoreData =
      lastStoredTime === undefined ||
      time - lastStoredTime >= DATA_SAMPLE_INTERVAL;

    if (!shouldStoreData) {
      set({
        currentState: newState,
        currentTime: time,
      });
      return;
    }

    set((state) => {
      const { masses, springs } = state.parameters;
      const { x1, x2, x3, v1, v2, v3 } = newState;

      const kinetic =
        0.5 * (masses[0] * v1 * v1 + masses[1] * v2 * v2 + masses[2] * v3 * v3);
      const potential =
        0.5 *
        (springs[0] * x1 * x1 +
          springs[1] * (x2 - x1) * (x2 - x1) +
          springs[2] * (x3 - x2) * (x3 - x2));
      const total = kinetic + potential;

      const shouldRemoveOldData =
        state.simulationData.time.length >= MAX_DATA_POINTS;

      return {
        currentState: newState,
        currentTime: time,
        simulationData: {
          time: shouldRemoveOldData
            ? [...state.simulationData.time.slice(1), time]
            : [...state.simulationData.time, time],
          positions: {
            x1: shouldRemoveOldData
              ? [...state.simulationData.positions.x1.slice(1), x1]
              : [...state.simulationData.positions.x1, x1],
            x2: shouldRemoveOldData
              ? [...state.simulationData.positions.x2.slice(1), x2]
              : [...state.simulationData.positions.x2, x2],
            x3: shouldRemoveOldData
              ? [...state.simulationData.positions.x3.slice(1), x3]
              : [...state.simulationData.positions.x3, x3],
          },
          velocities: {
            v1: shouldRemoveOldData
              ? [...state.simulationData.velocities.v1.slice(1), v1]
              : [...state.simulationData.velocities.v1, v1],
            v2: shouldRemoveOldData
              ? [...state.simulationData.velocities.v2.slice(1), v2]
              : [...state.simulationData.velocities.v2, v2],
            v3: shouldRemoveOldData
              ? [...state.simulationData.velocities.v3.slice(1), v3]
              : [...state.simulationData.velocities.v3, v3],
          },
          energies: {
            kinetic: shouldRemoveOldData
              ? [...state.simulationData.energies.kinetic.slice(1), kinetic]
              : [...state.simulationData.energies.kinetic, kinetic],
            potential: shouldRemoveOldData
              ? [...state.simulationData.energies.potential.slice(1), potential]
              : [...state.simulationData.energies.potential, potential],
            total: shouldRemoveOldData
              ? [...state.simulationData.energies.total.slice(1), total]
              : [...state.simulationData.energies.total, total],
          },
        },
      };
    });
  },

  captureResultsSnapshot: () =>
    set((state) => ({
      resultsSnapshot: {
        time: [...state.simulationData.time],
        positions: {
          x1: [...state.simulationData.positions.x1],
          x2: [...state.simulationData.positions.x2],
          x3: [...state.simulationData.positions.x3],
        },
        velocities: {
          v1: [...state.simulationData.velocities.v1],
          v2: [...state.simulationData.velocities.v2],
          v3: [...state.simulationData.velocities.v3],
        },
        energies: {
          kinetic: [...state.simulationData.energies.kinetic],
          potential: [...state.simulationData.energies.potential],
          total: [...state.simulationData.energies.total],
        },
      },
      resultsSnapshotTime: state.currentTime,
    })),

  clearResultsSnapshot: () =>
    set({
      resultsSnapshot: null,
      resultsSnapshotTime: null,
    }),

  setSimulationData: (data) => set({ simulationData: data }),

  loadPreset: (preset) => {
    const presets = {
      underdamped: {
        masses: [1.0, 1.0, 1.0] as [number, number, number],
        springs: [20.0, 20.0, 20.0] as [number, number, number],
        dampers: [0.5, 0.5, 0.5] as [number, number, number],
      },
      critical: {
        masses: [1.0, 1.0, 1.0] as [number, number, number],
        springs: [10.0, 10.0, 10.0] as [number, number, number],
        dampers: [6.32, 6.32, 6.32] as [number, number, number],
      },
      overdamped: {
        masses: [1.0, 1.0, 1.0] as [number, number, number],
        springs: [10.0, 10.0, 10.0] as [number, number, number],
        dampers: [10.0, 10.0, 10.0] as [number, number, number],
      },
      resonance: {
        masses: [1.0, 1.0, 1.0] as [number, number, number],
        springs: [15.0, 15.0, 15.0] as [number, number, number],
        dampers: [0.2, 0.2, 0.2] as [number, number, number],
      },
    };
    set((state) => ({
      parameters: presets[preset],
      activePreset: preset,
      isRunning: false,
      currentTime: 0,
      currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },
      simulationData: {
        time: [],
        positions: { x1: [], x2: [], x3: [] },
        velocities: { v1: [], v2: [], v3: [] },
        energies: { kinetic: [], potential: [], total: [] },
      },
      resultsSnapshot: null,
      resultsSnapshotTime: null,
      aiAnalysisToken: state.aiAnalysisToken + 1,
    }));
  },
}));
