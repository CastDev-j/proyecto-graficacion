"use client";

import { useSimulationStore } from "@/lib/store";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { INITIAL_SIMULATION_DATA } from "@/lib/constants";

// Mini-components
import { ResultsHeader } from "./results/results-header";
import { ResultsEmptyState } from "./results/results-empty-state";
import { SnapshotControls } from "./results/snapshot-controls";
import { ResultsChart } from "./results/results-chart";

export function ResultsSection({ inPopover = false }: { inPopover?: boolean }) {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const simulationData = useSimulationStore((state) =>
    state.isRunning
      ? (state.resultsSnapshot ?? INITIAL_SIMULATION_DATA)
      : state.simulationData,
  );
  const resultsSnapshotTime = useSimulationStore(
    (state) => state.resultsSnapshotTime,
  );
  const captureResultsSnapshot = useSimulationStore(
    (state) => state.captureResultsSnapshot,
  );

  const positionData = useMemo(() => {
    if (simulationData.time.length === 0) return [];
    return simulationData.time.map((t, i) => ({
      t: Number(t.toFixed(3)),
      x1: Number(simulationData.positions.x1[i].toFixed(4)),
      x2: Number(simulationData.positions.x2[i].toFixed(4)),
      x3: Number(simulationData.positions.x3[i].toFixed(4)),
    }));
  }, [simulationData.time, simulationData.positions]);

  const velocityData = useMemo(() => {
    if (simulationData.time.length === 0) return [];
    return simulationData.time.map((t, i) => ({
      t: Number(t.toFixed(3)),
      v1: Number(simulationData.velocities.v1[i].toFixed(4)),
      v2: Number(simulationData.velocities.v2[i].toFixed(4)),
      v3: Number(simulationData.velocities.v3[i].toFixed(4)),
    }));
  }, [simulationData.time, simulationData.velocities]);

  const energyData = useMemo(() => {
    if (simulationData.time.length === 0) return [];
    return simulationData.time.map((t, i) => ({
      t: Number(t.toFixed(3)),
      kinetic: Number(simulationData.energies.kinetic[i].toFixed(4)),
      potential: Number(simulationData.energies.potential[i].toFixed(4)),
      total: Number(simulationData.energies.total[i].toFixed(4)),
    }));
  }, [simulationData.time, simulationData.energies]);

  const hasData = simulationData.time.length > 0;

  return (
    <div
      className={cn(
        "h-full w-full overflow-y-auto p-4 md:p-6",
        !inPopover && "container mx-auto px-4",
      )}
      data-tour="results-section"
    >
      <div className={cn(!inPopover && "max-w-7xl mx-auto")}>
        <ResultsHeader inPopover={inPopover} isRunning={isRunning} />

        {!hasData ? (
          <ResultsEmptyState 
            isRunning={isRunning} 
            onCaptureSnapshot={captureResultsSnapshot} 
          />
        ) : (
          <div className="space-y-4">
            {isRunning && (
              <SnapshotControls 
                resultsSnapshotTime={resultsSnapshotTime} 
                onCaptureSnapshot={captureResultsSnapshot} 
              />
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <ResultsChart
                title="Desplazamiento"
                description="Posición de cada masa vs tiempo"
                data={positionData}
                inPopover={inPopover}
                tourId="results-displacement"
                lines={[
                  { dataKey: "x1", stroke: "#8b5cf6", name: "x₁" },
                  { dataKey: "x2", stroke: "#a855f7", name: "x₂" },
                  { dataKey: "x3", stroke: "#c084fc", name: "x₃" },
                ]}
              />

              <ResultsChart
                title="Velocidad"
                description="Velocidad de cada masa vs tiempo"
                data={velocityData}
                inPopover={inPopover}
                tourId="results-velocity"
                lines={[
                  { dataKey: "v1", stroke: "#8b5cf6", name: "v₁" },
                  { dataKey: "v2", stroke: "#a855f7", name: "v₂" },
                  { dataKey: "v3", stroke: "#c084fc", name: "v₃" },
                ]}
              />

              <ResultsChart
                title="Energía"
                description="Cinética, potencial y total"
                data={energyData}
                inPopover={inPopover}
                tourId="results-energy"
                lines={[
                  { dataKey: "kinetic", stroke: "#8b5cf6", name: "Cinética" },
                  { dataKey: "potential", stroke: "#a855f7", name: "Potencial" },
                  { dataKey: "total", stroke: "#c084fc", name: "Total" },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
