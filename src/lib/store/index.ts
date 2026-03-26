import { create } from "zustand";
export * from "./types";
import type { SimulationStore } from "./types";
import { createParamsSlice } from "./slices/params-slice";
import { createSimulationSlice } from "./slices/simulation-slice";
import { createDataSlice } from "./slices/data-slice";
import { createPresetSlice } from "./slices/preset-slice";

export const useSimulationStore = create<SimulationStore>()((...a) => ({
  ...createParamsSlice(...a),
  ...createSimulationSlice(...a),
  ...createDataSlice(...a),
  ...createPresetSlice(...a),
}));
