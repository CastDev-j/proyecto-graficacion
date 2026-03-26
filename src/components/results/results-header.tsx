"use client";

import { cn } from "@/lib/utils";

interface ResultsHeaderProps {
  inPopover?: boolean;
  isRunning: boolean;
}

export function ResultsHeader({ inPopover = false, isRunning }: ResultsHeaderProps) {
  return (
    <div className={cn("text-center", inPopover ? "mb-6" : "mb-10")}>
      <h2
        className={cn(
          "font-bold mb-2",
          inPopover ? "text-2xl" : "text-4xl",
        )}
      >
        Resultados de la Simulación
      </h2>
      <p className="text-base text-muted-foreground">
        Desplazamientos, velocidades, energías y espacio fase
      </p>
      {isRunning && (
        <p className="text-xs text-primary mt-1">
          Simulación en progreso. Captura un instante para actualizar las
          gráficas.
        </p>
      )}
    </div>
  );
}
