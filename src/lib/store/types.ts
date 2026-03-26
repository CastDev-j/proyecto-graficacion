export interface SystemParams {
  masses: [number, number, number];
  springs: [number, number, number];
  dampingRatios: [number, number, number]; // zeta (0 a 1+)
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

export type PresetType = "underdamped" | "critical" | "overdamped" | "resonance";

export interface ParamsSlice {
  parameters: SystemParams;
  force: ForceConfig;
  method: "numerical" | "laplace";
  setParameters: (params: Partial<SystemParams>) => void;
  setForce: (force: Partial<ForceConfig>) => void;
  setMethod: (method: "numerical" | "laplace") => void;
}

export interface SimulationSlice {
  isRunning: boolean;
  currentTime: number;
  timeStep: number;
  speedMultiplier: number;
  currentState: StateVector;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  setSpeedMultiplier: (speed: number) => void;
  updateSimulation: (newState: StateVector, time: number) => void;
}

export interface DataSlice {
  simulationData: SimulationData;
  resultsSnapshot: SimulationData | null;
  resultsSnapshotTime: number | null;
  captureResultsSnapshot: () => void;
  setSimulationData: (data: SimulationData) => void;
}

export interface PresetSlice {
  activePreset: null | PresetType;
  aiAnalysisToken: number; // incremented on input changes to clear AI analysis
  loadPreset: (preset: PresetType) => void;
}

export type SimulationStore = ParamsSlice & SimulationSlice & DataSlice & PresetSlice;
