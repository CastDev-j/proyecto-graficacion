import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface MassProps {
  position: [number, number, number];
  label: string;
  value: number;
  color: string;
}

export function Mass({ position, label, value, color }: MassProps) {
  const geometry = useMemo(() => new THREE.BoxGeometry(1.2, 1.2, 1.2), []);

  return (
    <group position={position}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} />
      </mesh>
      <Html position={[0, 0, 0.65]} center distanceFactor={8} occlude={false}>
        <div className="text-white font-bold text-2xl pointer-events-none select-none drop-shadow-md">
          {label}
        </div>
      </Html>
      <Html position={[0, -0.9, 0]} center distanceFactor={8} occlude={false}>
        <div
          className="font-mono text-sm pointer-events-none select-none bg-background/50 px-1 rounded shadow-sm"
          style={{ color }}
        >
          {value.toFixed(1)} kg
        </div>
      </Html>
    </group>
  );
}
