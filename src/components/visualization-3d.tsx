"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { MechanicalSystem3D } from "./mechanical-system-3d";
import { SimulationHUD } from "./simulation-hud";
import { Loader2, Play, Pause, RotateCcw, BarChart3 } from "lucide-react";
import { useSimulationStore } from "@/lib/store";
import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ResultsSection } from "./results-section";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("3D Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-background p-4">
          <div className="text-center text-destructive">
            <p className="font-bold">Error en la visualización 3D</p>
            <p className="text-sm mt-2">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function Visualization3D() {
  const isRunning = useSimulationStore((s) => s.isRunning);
  const startSimulation = useSimulationStore((s) => s.startSimulation);
  const stopSimulation = useSimulationStore((s) => s.stopSimulation);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  return (
    <section
      className="relative h-screen w-screen overflow-hidden"
      data-tour="visualization-3d"
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            dpr={[1, 1.5]}
            className="h-full w-full"
            performance={{ min: 0.5 }}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: false,
              stencil: false,
              depth: true,
            }}
            onCreated={({ scene }) => {
              scene.background = new THREE.Color("#ffffff");
            }}
          >
            <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={5}
              maxDistance={18}
              target={[0, 0.2, 0]}
              makeDefault
            />

            <Grid
              args={[14, 14]}
              cellSize={1}
              cellThickness={0.4}
              cellColor="#525252"
              sectionSize={7}
              sectionThickness={0.8}
              sectionColor="#6d6d6d"
              fadeDistance={18}
              fadeStrength={0.8}
              position={[0, -2.05, 0]}
            />

            <MechanicalSystem3D />
          </Canvas>
        </Suspense>
      </ErrorBoundary>

      <div className="absolute top-3 left-3 z-20">
        <SimulationHUD />
      </div>

      <div className="absolute right-3 bottom-3 z-30 flex items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 shadow-sm backdrop-blur-sm">
        <SimulationTimeLabel />
        <Button
          size="sm"
          variant={isRunning ? "default" : "outline"}
          onClick={isRunning ? stopSimulation : startSimulation}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </>
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={resetSimulation}>
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="secondary">
              <BarChart3 className="h-4 w-4 mr-2" />
              Resultados
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[min(94vw,1100px)] h-[82vh] p-0 overflow-hidden"
          >
            <ResultsSection inPopover />
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
}

function SimulationTimeLabel() {
  const currentTime = useSimulationStore((s) => s.currentTime);

  return (
    <span className="text-sm text-muted-foreground mr-2">
      t = {currentTime.toFixed(2)}s
    </span>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Cargando visualización 3D...
        </p>
      </div>
    </div>
  );
}
