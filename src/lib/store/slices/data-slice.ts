import type { StateCreator } from "zustand";
import type { SimulationStore, DataSlice } from "../types";
import { INITIAL_SIMULATION_DATA } from "../../constants";

export const createDataSlice: StateCreator<
  SimulationStore,
  [],
  [],
  DataSlice
> = (set) => ({
  simulationData: { ...INITIAL_SIMULATION_DATA },
  resultsSnapshot: null,
  resultsSnapshotTime: null,

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

  setSimulationData: (data) => set({ simulationData: data }),
});
