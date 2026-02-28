"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSimulationStore } from "@/lib/store";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const EMPTY_RESULTS = {
  time: [] as number[],
  positions: { x1: [] as number[], x2: [] as number[], x3: [] as number[] },
  velocities: { v1: [] as number[], v2: [] as number[], v3: [] as number[] },
  energies: {
    kinetic: [] as number[],
    potential: [] as number[],
    total: [] as number[],
  },
};

export function ResultsSection({ inPopover = false }: { inPopover?: boolean }) {
  const isRunning = useSimulationStore((state) => state.isRunning);
  const simulationData = useSimulationStore((state) =>
    state.isRunning
      ? (state.resultsSnapshot ?? EMPTY_RESULTS)
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

        {!hasData ? (
          <Card>
            <CardContent className="py-12 text-center">
              {isRunning ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    La simulación está corriendo. Pulsa para mostrar resultados
                    en este instante.
                  </p>
                  <Button onClick={captureResultsSnapshot} size="sm">
                    Mostrar resultados ahora
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Inicia la simulación para generar resultados.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isRunning && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Mostrando captura en t ={" "}
                  {resultsSnapshotTime?.toFixed(3) ?? "0.000"} s
                </p>
                <Button
                  onClick={captureResultsSnapshot}
                  size="sm"
                  variant="secondary"
                >
                  Actualizar captura
                </Button>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card
                className="overflow-hidden"
                data-tour="results-displacement"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Desplazamiento</CardTitle>
                  <CardDescription className="text-xs">
                    Posición de cada masa vs tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer
                    width="100%"
                    height={inPopover ? 260 : 330}
                  >
                    <LineChart
                      data={positionData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="t"
                        stroke="hsl(var(--foreground))"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="hsl(var(--foreground))"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="x1"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        name="x₁"
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="x2"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                        name="x₂"
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="x3"
                        stroke="#c084fc"
                        strokeWidth={2}
                        dot={false}
                        name="x₃"
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="overflow-hidden" data-tour="results-velocity">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Velocidad</CardTitle>
                  <CardDescription className="text-xs">
                    Velocidad de cada masa vs tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer
                    width="100%"
                    height={inPopover ? 260 : 330}
                  >
                    <LineChart
                      data={velocityData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="t"
                        stroke="hsl(var(--foreground))"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="hsl(var(--foreground))"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="v1"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        name="v₁"
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="v2"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                        name="v₂"
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="v3"
                        stroke="#c084fc"
                        strokeWidth={2}
                        dot={false}
                        name="v₃"
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="overflow-hidden" data-tour="results-energy">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Energía</CardTitle>
                  <CardDescription className="text-xs">
                    Cinética, potencial y total
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer
                    width="100%"
                    height={inPopover ? 260 : 330}
                  >
                    <LineChart
                      data={energyData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="t"
                        stroke="hsl(var(--foreground))"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="hsl(var(--foreground))"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="kinetic"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        name="Cinética"
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="potential"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                        name="Potencial"
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#c084fc"
                        strokeWidth={2}
                        dot={false}
                        name="Total"
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
