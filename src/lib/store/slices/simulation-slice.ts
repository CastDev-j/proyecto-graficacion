import type { StateCreator } from "zustand";
import type { SimulationStore, SimulationSlice, StateVector } from "../types";
import { SIMULATION_CONSTANTS, INITIAL_SIMULATION_DATA } from "../../constants";

const { DATA_SAMPLE_INTERVAL, MAX_DATA_POINTS } = SIMULATION_CONSTANTS;

export const createSimulationSlice: StateCreator<
  SimulationStore,
  [],
  [],
  SimulationSlice
> = (set, get) => ({
  isRunning: false,
  currentTime: 0,
  timeStep: 0.01,
  speedMultiplier: 1.0,
  currentState: { x1: 0, v1: 0, x2: 0, v2: 0, x3: 0, v3: 0 },

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
      simulationData: { ...INITIAL_SIMULATION_DATA },
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
});
