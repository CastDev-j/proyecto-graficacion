"use client";

import { useEffect, useRef } from "react";
import { Leva, button, folder, useControls } from "leva";
import { useSimulationStore } from "@/lib/store";

type ForceType = "step" | "sine" | "sawtooth" | "square" | "triangle";
type MethodType = "numerical" | "laplace";

const levaTheme = {
  colors: {
    elevation1: "hsl(0, 0%, 97%)",
    elevation2: "hsl(0, 0%, 97%)",
    elevation3: "hsl(var(--muted))",
    accent1: "hsl(var(--primary))",
    accent2: "hsl(var(--primary))",
    accent3: "hsl(var(--primary))",
    highlight1: "hsl(var(--muted-foreground))",
    highlight2: "hsl(var(--secondary-foreground))",
    highlight3: "hsl(var(--foreground))",
    vivid1: "hsl(var(--primary))",
    folderWidgetColor: "hsl(var(--primary))",
    folderTextColor: "hsl(var(--card-foreground))",
    toolTipBackground: "hsl(var(--popover))",
    toolTipText: "hsl(var(--popover-foreground))",
  },
  radii: {
    xs: "2px",
    sm: "8px",
    lg: "12px",
  },
  space: {
    sm: "8px",
    md: "12px",
    rowGap: "10px",
    colGap: "10px",
  },
  fontSizes: {
    root: "13px",
    toolTip: "12px",
  },
  sizes: {
    rootWidth: "460px",
    controlWidth: "220px",
    scrubberWidth: "8px",
    scrubberHeight: "16px",
    rowHeight: "36px",
    folderHeight: "24px",
    folderTitleHeight: "30px",
    checkboxSize: "16px",
    joystickWidth: "100px",
    joystickHeight: "100px",
    colorPickerWidth: "210px",
    colorPickerHeight: "110px",
    monitorHeight: "60px",
    titleBarHeight: "44px",
  },
  borderWidths: {
    root: "1px",
    input: "1px",
    focus: "2px",
    hover: "1px",
    active: "1px",
    folder: "1px",
  },
  fontWeights: {
    label: "600",
    folder: "600",
    button: "500",
  },
};

export function ControlPanel() {
  const parameters = useSimulationStore((s) => s.parameters);
  const force = useSimulationStore((s) => s.force);
  const method = useSimulationStore((s) => s.method);
  const setParameters = useSimulationStore((s) => s.setParameters);
  const setForce = useSimulationStore((s) => s.setForce);
  const setMethod = useSimulationStore((s) => s.setMethod);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const loadPreset = useSimulationStore((s) => s.loadPreset);
  const activePreset = useSimulationStore((s) => s.activePreset);

  const initialValues = {
    m1: parameters.masses[0],
    m2: parameters.masses[1],
    m3: parameters.masses[2],
    k1: parameters.springs[0],
    k2: parameters.springs[1],
    k3: parameters.springs[2],
    zeta1: parameters.dampingRatios[0],
    zeta2: parameters.dampingRatios[1],
    zeta3: parameters.dampingRatios[2],
    forceType: force.type,
    method,
    amplitude: force.amplitude,
    frequency: force.frequency,
    offset: force.offset,
  };

  const [controls, setControlValues] = useControls("Parámetros", () => ({
    "Sistema físico": folder({
      m1: { value: initialValues.m1, min: 0.1, max: 5, step: 0.1 },
      m2: { value: initialValues.m2, min: 0.1, max: 5, step: 0.1 },
      m3: { value: initialValues.m3, min: 0.1, max: 5, step: 0.1 },
      k1: { value: initialValues.k1, min: 1, max: 100, step: 1 },
      k2: { value: initialValues.k2, min: 1, max: 100, step: 1 },
      k3: { value: initialValues.k3, min: 1, max: 100, step: 1 },
      zeta1: { value: initialValues.zeta1, min: 0, max: 5, step: 0.01, label: "ζ1 (Amort.)" },
      zeta2: { value: initialValues.zeta2, min: 0, max: 5, step: 0.01, label: "ζ2 (Amort.)" },
      zeta3: { value: initialValues.zeta3, min: 0, max: 5, step: 0.01, label: "ζ3 (Amort.)" },
    }),
    "Excitación externa": folder({
      forceType: {
        label: "Tipo de fuerza",
        options: {
          Sinusoidal: "sine",
          Escalón: "step",
          Sierra: "sawtooth",
          Cuadrada: "square",
          Triangular: "triangle",
        },
        value: initialValues.forceType,
      },
      method: {
        label: "Método",
        options: {
          "Numérico (RK4)": "numerical",
          "Laplace (escalón)": "laplace",
        },
        value: initialValues.method,
        render: (get: (path: string) => unknown) => get("forceType") === "step",
      },
      amplitude: {
        label: "Amplitud (N)",
        value: initialValues.amplitude,
        min: 0,
        max: 20,
        step: 0.5,
      },
      frequency: {
        label: "Frecuencia (Hz)",
        value: initialValues.frequency,
        min: 0.1,
        max: 5,
        step: 0.1,
      },
      offset: {
        label: "Offset (N)",
        value: initialValues.offset,
        min: -20,
        max: 20,
        step: 0.5,
      },
    }),
    "Acciones rápidas": folder({
      "Preset subamortiguado": button(() => loadPreset("underdamped")),
      "Preset crítico": button(() => loadPreset("critical")),
      "Preset sobreamortiguado": button(() => loadPreset("overdamped")),
      "Preset resonancia": button(() => loadPreset("resonance")),
      Reiniciar: button(() => resetSimulation()),
    }),
  }));

  useEffect(() => {
    if (!activePreset) {
      return;
    }

    const normalizedMethod: MethodType =
      force.type === "step" ? method : "numerical";

    setControlValues({
      m1: parameters.masses[0],
      m2: parameters.masses[1],
      m3: parameters.masses[2],
      k1: parameters.springs[0],
      k2: parameters.springs[1],
      k3: parameters.springs[2],
      zeta1: parameters.dampingRatios[0],
      zeta2: parameters.dampingRatios[1],
      zeta3: parameters.dampingRatios[2],
      forceType: force.type,
      method: normalizedMethod,
      amplitude: force.amplitude,
      frequency: force.frequency,
      offset: force.offset,
    });
  }, [activePreset, force, method, parameters, setControlValues]);

  const lastApplied = useRef("");

  useEffect(() => {
    const forceType = controls.forceType as ForceType;
    const selectedMethod = controls.method as MethodType;
    const normalizedMethod: MethodType =
      forceType === "step" ? selectedMethod : "numerical";

    const signature = JSON.stringify({
      m1: controls.m1,
      m2: controls.m2,
      m3: controls.m3,
      k1: controls.k1,
      k2: controls.k2,
      k3: controls.k3,
      zeta1: controls.zeta1,
      zeta2: controls.zeta2,
      zeta3: controls.zeta3,
      forceType,
      method: normalizedMethod,
      amplitude: controls.amplitude,
      frequency: controls.frequency,
      offset: controls.offset,
    });

    if (lastApplied.current === signature) {
      return;
    }

    lastApplied.current = signature;

    setParameters({
      masses: [controls.m1, controls.m2, controls.m3],
      springs: [controls.k1, controls.k2, controls.k3],
      dampingRatios: [controls.zeta1, controls.zeta2, controls.zeta3],
    });

    setForce({
      type: forceType,
      amplitude: controls.amplitude,
      frequency: controls.frequency,
      offset: controls.offset,
    });

    setMethod(normalizedMethod);
  }, [controls, setForce, setMethod, setParameters]);

  return (
    <Leva
      collapsed={false}
      oneLineLabels={false}
      titleBar={{ title: "Menú de parámetros", drag: false, filter: true }}
      hideCopyButton
      flat
      theme={levaTheme}
    />
  );
}
