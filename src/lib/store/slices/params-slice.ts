import type { StateCreator } from "zustand";
import type { SimulationStore, ParamsSlice } from "../types";
import { INITIAL_SIMULATION_DATA } from "../../constants";

export const createParamsSlice: StateCreator<
  SimulationStore,
  [],
  [],
  ParamsSlice
> = (set) => ({
  parameters: {
    masses: [1.0, 1.0, 1.0],
    springs: [15.0, 15.0, 15.0],
    dampingRatios: [0.05, 0.05, 0.05],
  },
  force: {
    type: "sine",
    amplitude: 5.0,
    frequency: 1.0,
    offset: 0,
  },
  method: "numerical",

  setParameters: (params) =>
    set((state) => ({
      parameters: { ...state.parameters, ...params },
      activePreset: null,
      simulationData: { ...INITIAL_SIMULATION_DATA },
      resultsSnapshot: null,
      resultsSnapshotTime: null,
      currentTime: 0,
      currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },
      aiAnalysisToken: state.aiAnalysisToken + 1,
    })),

  setForce: (force) =>
    set((state) => {
      const newForce = { ...state.force, ...force };
      const newMethod = newForce.type !== "step" ? "numerical" : state.method;
      return {
        force: newForce,
        method: newMethod,
        simulationData: { ...INITIAL_SIMULATION_DATA },
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
      simulationData: { ...INITIAL_SIMULATION_DATA },
      resultsSnapshot: null,
      resultsSnapshotTime: null,
      currentTime: 0,
      currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },
      aiAnalysisToken: state.aiAnalysisToken + 1,
    })),
});
