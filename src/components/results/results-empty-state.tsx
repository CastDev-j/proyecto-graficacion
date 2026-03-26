"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultsEmptyStateProps {
  isRunning: boolean;
  onCaptureSnapshot: () => void;
}

export function ResultsEmptyState({ isRunning, onCaptureSnapshot }: ResultsEmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        {isRunning ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              La simulación está corriendo. Pulsa para mostrar resultados
              en este instante.
            </p>
            <Button onClick={onCaptureSnapshot} size="sm">
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
  );
}
