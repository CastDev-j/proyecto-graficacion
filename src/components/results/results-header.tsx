"use client";

import { cn } from "@/lib/utils";

import { useSimulationStore } from "@/lib/store";

interface ResultsHeaderProps {
  inPopover?: boolean;
  isRunning: boolean;
}

export function ResultsHeader({ inPopover = false, isRunning }: ResultsHeaderProps) {
  const parameters = useSimulationStore((state) => state.parameters);
  
  return (
    <div className={cn("text-center", inPopover ? "mb-6" : "mb-8")}>
      <h2
        className={cn(
          "font-bold mb-2",
          inPopover ? "text-2xl" : "text-4xl",
        )}
      >
        Resultados de la Simulación
      </h2>
      
      <div className="flex flex-wrap justify-center gap-4 mb-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
        <span>Masas: {parameters.masses.join(", ")} kg</span>
        <span className="hidden md:inline">•</span>
        <span>Resortes: {parameters.springs.join(", ")} N/m</span>
        <span className="hidden md:inline">•</span>
        <span>Zeta: {parameters.dampingRatios.join(", ")}</span>
      </div>

      <p className="text-base text-muted-foreground">
        Desplazamientos, velocidades y energías
      </p>
      {isRunning && (
        <p className="text-xs text-primary mt-1 animate-pulse">
          Simulación en progreso. Captura un instante para actualizar las gráficas.
        </p>
      )}
    </div>
  );
}
