"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useSimulationStore } from "@/lib/store";
import { rk4Step, getForceFunction, laplaceStep } from "@/lib/physics-engine";
import { SIMULATION_CONSTANTS } from "@/lib/constants";

// Nuevos componentes modulares
import { Mass } from "./simulation/mass";
import { ConnectionModule } from "./simulation/connection-module";

const {
  SCALE,
  HALF_MASS,
  WALL_X,
  WALL_THICKNESS,
  BASE_POSITIONS,
} = SIMULATION_CONSTANTS;

export function MechanicalSystem3D() {
  const currentState = useSimulationStore((state) => state.currentState);
  const parameters = useSimulationStore((state) => state.parameters);
  const force = useSimulationStore((state) => state.force);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const timeStep = useSimulationStore((state) => state.timeStep);
  const currentTime = useSimulationStore((state) => state.currentTime);
  const updateSimulation = useSimulationStore(
    (state) => state.updateSimulation,
  );
  const method = useSimulationStore((state) => state.method);

  const forceFunctionRef = useRef(getForceFunction(force));

  useMemo(() => {
    forceFunctionRef.current = getForceFunction(force);
  }, [force.type, force.amplitude, force.frequency, force.offset]);

  useFrame(() => {
    if (!isRunning) return;
    const newTime = currentTime + timeStep;

    let newState: typeof currentState;
    if (method === "laplace" && force.type === "step") {
      newState = laplaceStep(parameters, force, newTime);
    } else {
      newState = rk4Step(
        currentState,
        parameters,
        forceFunctionRef.current,
        timeStep,
        currentTime,
      );
    }

    updateSimulation(newState, newTime);
  });

  const { x1, x2, x3 } = currentState;

  const p1: [number, number, number] = [BASE_POSITIONS[0] + x1 * SCALE, 0, 0];
  const p2: [number, number, number] = [BASE_POSITIONS[1] + x2 * SCALE, 0, 0];
  const p3: [number, number, number] = [BASE_POSITIONS[2] + x3 * SCALE, 0, 0];
  
  const wallHalfThickness = WALL_THICKNESS / 2;
  const springStartOffset = 0.01;

  // Calibración exacta de longitud natural (L0) en reposo
  const L0_1 = Math.abs((BASE_POSITIONS[0] - HALF_MASS) - (WALL_X + wallHalfThickness + springStartOffset));
  const L0_2 = Math.abs((BASE_POSITIONS[1] - HALF_MASS) - (BASE_POSITIONS[0] + HALF_MASS));
  const L0_3 = Math.abs((BASE_POSITIONS[2] - HALF_MASS) - (BASE_POSITIONS[1] + HALF_MASS));

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[WALL_X, 0, 0]}>
        <boxGeometry args={[0.5, 4, 2]} />
        <meshBasicMaterial color="#6d28d9" />
      </mesh>

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow={false}
      />

      <Mass
        position={p1}
        label="m₁"
        value={parameters.masses[0]}
        color="#8b5cf6"
      />
      <ConnectionModule
        start={[WALL_X + wallHalfThickness + 0.01, 0, 0]}
        end={[p1[0] - HALF_MASS, 0, 0]}
        colorSpring="#a78bfa"
        colorPiston="#64748b"
        naturalLength={L0_1}
      />

      <Mass
        position={p2}
        label="m₂"
        value={parameters.masses[1]}
        color="#a855f7"
      />
      <ConnectionModule
        start={[p1[0] + HALF_MASS, 0, 0]}
        end={[p2[0] - HALF_MASS, 0, 0]}
        colorSpring="#c084fc"
        colorPiston="#64748b"
        naturalLength={L0_2}
      />

      <Mass
        position={p3}
        label="m₃"
        value={parameters.masses[2]}
        color="#c026d3"
      />
      <ConnectionModule
        start={[p2[0] + HALF_MASS, 0, 0]}
        end={[p3[0] - HALF_MASS, 0, 0]}
        colorSpring="#d8b4fe"
        colorPiston="#64748b"
        naturalLength={L0_3}
      />
    </group>
  );
}
