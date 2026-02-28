"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useSimulationStore } from "@/lib/store";
import { rk4Step, getForceFunction, laplaceStep } from "@/lib/physics-engine";
import * as THREE from "three";

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

  const basePositions = [-2.5, 0, 2.5] as const;
  const wallX = -4.2;
  const scale = 0.9;

  const p1: [number, number, number] = [basePositions[0] + x1 * scale, 0, 0];
  const p2: [number, number, number] = [basePositions[1] + x2 * scale, 0, 0];
  const p3: [number, number, number] = [basePositions[2] + x3 * scale, 0, 0];
  const halfMass = 0.6;
  const wallHalfThickness = 0.25;

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[wallX, 0, 0]}>
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
        start={[wallX + wallHalfThickness + 0.01, 0, 0]}
        end={[p1[0] - halfMass, 0, 0]}
        colorSpring="#a78bfa"
        colorPiston="#64748b"
      />

      <Mass
        position={p2}
        label="m₂"
        value={parameters.masses[1]}
        color="#a855f7"
      />
      <ConnectionModule
        start={[p1[0] + halfMass, 0, 0]}
        end={[p2[0] - halfMass, 0, 0]}
        colorSpring="#c084fc"
        colorPiston="#64748b"
      />

      <Mass
        position={p3}
        label="m₃"
        value={parameters.masses[2]}
        color="#c026d3"
      />
      <ConnectionModule
        start={[p2[0] + halfMass, 0, 0]}
        end={[p3[0] - halfMass, 0, 0]}
        colorSpring="#d8b4fe"
        colorPiston="#64748b"
      />
    </group>
  );
}

function Mass({
  position,
  label,
  value,
  color,
}: {
  position: [number, number, number];
  label: string;
  value: number;
  color: string;
}) {
  const geometry = useMemo(() => new THREE.BoxGeometry(1.2, 1.2, 1.2), []);

  return (
    <group position={position}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} />
      </mesh>
      <Html position={[0, 0, 0.65]} center distanceFactor={8} occlude={false}>
        <div className="text-white font-bold text-2xl pointer-events-none select-none">
          {label}
        </div>
      </Html>
      <Html position={[0, -0.9, 0]} center distanceFactor={8} occlude={false}>
        <div
          className="font-mono text-sm pointer-events-none select-none"
          style={{ color }}
        >
          {value.toFixed(1)} kg
        </div>
      </Html>
    </group>
  );
}

function ConnectionModule({
  start,
  end,
  colorSpring,
  colorPiston,
}: {
  start: [number, number, number];
  end: [number, number, number];
  colorSpring: string;
  colorPiston: string;
}) {
  const { length, rotY, rotZ, curve, samples } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(endVec, startVec);
    const length = dir.length();

    const coils = 5;
    const radius = 0.18;
    const points: THREE.Vector3[] = [];
    const samples = coils * 8;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const angle = t * coils * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          t * length,
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(points);

    const rotY = Math.atan2(dir.z, dir.x);
    const rotZ = Math.atan2(dir.y, Math.sqrt(dir.x * dir.x + dir.z * dir.z));

    return { length, rotY, rotZ, curve, samples };
  }, [start, end]);

  if (length < 0.001) return null;

  // Piston dimensions
  const pistonOuterRadius = 0.12;
  const pistonInnerRadius = 0.06;
  const housingLength = length * 0.45;
  const rodLength = length * 0.45;

  return (
    <group position={start} rotation={[0, rotY, rotZ]}>
      {/* Spring */}
      <mesh position={[0, 0, 0]}>
        <tubeGeometry args={[curve, samples, 0.035, 5, false]} />
        <meshBasicMaterial color={colorSpring} />
      </mesh>
      {/* Housing (left) */}
      <mesh position={[length * 0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[pistonOuterRadius, pistonOuterRadius, housingLength, 8]}
        />
        <meshBasicMaterial color={colorPiston} />
      </mesh>
      {/* Rod (right) */}
      <mesh position={[length * 0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[pistonInnerRadius, pistonInnerRadius, rodLength, 8]}
        />
        <meshBasicMaterial color={colorPiston} />
      </mesh>
    </group>
  );
}
