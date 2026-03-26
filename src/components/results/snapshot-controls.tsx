"use client";

import { Button } from "@/components/ui/button";

interface SnapshotControlsProps {
  resultsSnapshotTime: number | null;
  onCaptureSnapshot: () => void;
}

export function SnapshotControls({ resultsSnapshotTime, onCaptureSnapshot }: SnapshotControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Mostrando captura en t ={" "}
        {resultsSnapshotTime?.toFixed(3) ?? "0.000"} s
      </p>
      <Button
        onClick={onCaptureSnapshot}
        size="sm"
        variant="secondary"
      >
        Actualizar captura
      </Button>
    </div>
  );
}
