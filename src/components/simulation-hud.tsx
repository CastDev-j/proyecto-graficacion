"use client";

import { useMemo } from "react";
import { useSimulationStore } from "@/lib/store";
import { getForceFunction } from "@/lib/physics-engine";

export function SimulationHUD() {
  const force = useSimulationStore((s) => s.force);
  const parameters = useSimulationStore((s) => s.parameters);
  const currentTime = useSimulationStore((s) => s.currentTime);
  const currentState = useSimulationStore((s) => s.currentState);
  const isRunning = useSimulationStore((s) => s.isRunning);

  const forceFunction = useMemo(() => getForceFunction(force), [force]);
  const F = forceFunction(currentTime);

  return (
    <div className="pointer-events-none select-none text-[11px] leading-tight font-mono space-y-1 bg-background/70 backdrop-blur-sm border border-border rounded-md p-2">
      <div className="flex justify-between">
        <span className="font-semibold">t:</span>
        <span>{currentTime.toFixed(2)} s</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">F(t):</span>
        <span>{F.toFixed(2)} N</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {parameters.masses.map((m, i) => (
          <div key={i} className="text-center">
            m{i + 1}: {m.toFixed(2)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {parameters.springs.map((k, i) => (
          <div key={i} className="text-center">
            k{i + 1}: {k.toFixed(0)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {parameters.dampingRatios.map((z, i) => (
          <div key={i} className="text-center">
            ζ{i + 1}: {z.toFixed(2)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1">
        <div>x1: {currentState.x1.toFixed(3)}</div>
        <div>x2: {currentState.x2.toFixed(3)}</div>
        <div>x3: {currentState.x3.toFixed(3)}</div>
      </div>
      <div className="text-center text-[10px] mt-1 opacity-70">
        {isRunning ? "Simulando..." : "Pausado"}
      </div>
    </div>
  );
}
