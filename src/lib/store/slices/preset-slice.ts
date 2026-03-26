import type { StateCreator } from "zustand";
import type { SimulationStore, PresetSlice, PresetType } from "../types";
import { INITIAL_SIMULATION_DATA } from "../../constants";

export const createPresetSlice: StateCreator<
  SimulationStore,
  [],
  [],
  PresetSlice
> = (set) => ({
  activePreset: null,
  aiAnalysisToken: 0,

  loadPreset: (preset) => {
    const presets: Record<PresetType, { masses: [number, number, number]; springs: [number, number, number]; dampingRatios: [number, number, number] }> = {
      underdamped: {
        masses: [1.0, 1.0, 1.0],
        springs: [30.0, 30.0, 30.0],
        dampingRatios: [0.02, 0.02, 0.02],
      },
      critical: {
        masses: [1.0, 1.0, 1.0],
        springs: [15.0, 15.0, 15.0],
        dampingRatios: [1.0, 1.0, 1.0],
      },
      overdamped: {
        masses: [1.0, 1.0, 1.0],
        springs: [15.0, 15.0, 15.0],
        dampingRatios: [2.5, 2.5, 2.5],
      },
      resonance: {
        masses: [1.0, 1.0, 1.0],
        springs: [12.0, 12.0, 12.0],
        dampingRatios: [0.005, 0.005, 0.005],
      },
    };

    set((state) => ({
      parameters: presets[preset],
      activePreset: preset,
      isRunning: false,
      currentTime: 0,
      currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },
      simulationData: { ...INITIAL_SIMULATION_DATA },
      resultsSnapshot: null,
      resultsSnapshotTime: null,
      aiAnalysisToken: state.aiAnalysisToken + 1,
    }));
  },
});
