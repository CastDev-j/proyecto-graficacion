import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import "./fatigue-material";
interface ConnectionModuleProps {
  start: [number, number, number];
  end: [number, number, number];
  colorSpring: string;
  colorPiston: string;
  naturalLength: number;
}

export function ConnectionModule({
  start,
  end,
  colorSpring,
  colorPiston,
  naturalLength,
}: ConnectionModuleProps) {
  const springMatRef = useRef<any>(null);

  const { length, rotY, rotZ, curve, samples } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(endVec, startVec);
    const length = dir.length();

    const coils = 5;
    const radius = 0.18;
    const points: THREE.Vector3[] = [];
    const samples = coils * 12;
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

  useFrame(() => {
    if (springMatRef.current) {
      const diff = length - naturalLength;
      const deformation = Math.abs(diff);

      // Sensibilidad asimétrica: más fuerte en compresión (diff < 0)
      const multiplier = diff < 0 ? 3.8 : 2.5;
      const stressTarget = Math.min(deformation * multiplier, 1.0);

      springMatRef.current.uStress = THREE.MathUtils.lerp(
        springMatRef.current.uStress,
        stressTarget,
        0.1
      );
    }
  });

  if (length < 0.001) return null;

  const pistonOuterRadius = 0.12;
  const pistonInnerRadius = 0.06;
  const housingLength = length * 0.45;
  const rodLength = length * 0.45;

  return (
    <group position={start} rotation={[0, rotY, rotZ]}>
      <mesh position={[0, 0, 0]}>
        <tubeGeometry args={[curve, samples, 0.04, 8, false]} />
        <fatigueMaterial
          ref={springMatRef}
          uBaseColor={new THREE.Color(colorSpring)}
          uFatigueColor={new THREE.Color("#ff0000")}
        />
      </mesh>

      <mesh position={[length * 0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[pistonOuterRadius, pistonOuterRadius, housingLength, 12]}
        />
        <meshBasicMaterial color={colorPiston} />
      </mesh>

      <mesh position={[length * 0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[pistonInnerRadius, pistonInnerRadius, rodLength, 12]}
        />
        <meshBasicMaterial color={colorPiston} />
      </mesh>
    </group>
  );
}
