"use client";

import { Button, Card, Typography } from "@heroui/react";
import { FiRefreshCw } from "react-icons/fi";

type Props = {
  error?: string;
  isFetching?: boolean;
  onRetry?: () => void;
  state: "loading" | "error" | "empty";
};

export function PlansState({ error, isFetching, onRetry, state }: Props) {
  return (
    <div role="status">
      <Card className="site-card">
        <Card.Content className="space-y-4 p-7">
          <Typography.Paragraph className="text-sm leading-7 text-muted">
            {state === "loading"
              ? "Cargando planes empresariales…"
              : state === "empty"
                ? "Actualmente no hay planes empresariales publicados. Puedes solicitar acceso para evaluación."
                : error || "No se pudieron cargar los planes en este momento."}
          </Typography.Paragraph>
          {state === "error" && onRetry ? (
            <Button
              isDisabled={isFetching}
              isPending={isFetching}
              variant="secondary"
              onPress={onRetry}
            >
              <FiRefreshCw aria-hidden="true" className="size-4" />
              Reintentar
            </Button>
          ) : null}
        </Card.Content>
      </Card>
    </div>
  );
}
