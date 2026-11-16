"use client";

import { Button, Card, Typography } from "@heroui/react";
import { FiAlertCircle, FiInbox, FiRefreshCw } from "react-icons/fi";

type Props = {
  error?: string;
  isFetching?: boolean;
  onRetry?: () => void;
  state: "loading" | "error" | "empty";
};

export function PlansState({ error, isFetching, onRetry, state }: Props) {
  if (state === "loading") {
    // Esqueleto con la misma estructura que una tarjeta de plan, para que no "salte" el diseño al cargar
    return (
      <div aria-busy="true" role="status">
        <span className="sr-only">Cargando planes empresariales…</span>
        <Card className="site-card h-full border border-brand-600/20">
          <Card.Content className="space-y-4 p-7 sm:p-9" aria-hidden="true">
            <div className="h-6 w-32 animate-pulse rounded-full bg-brand-600/10 motion-reduce:animate-none" />
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-brand-600/10 motion-reduce:animate-none" />
            <div className="h-9 w-1/3 animate-pulse rounded-lg bg-brand-600/10 motion-reduce:animate-none" />
            <div className="h-4 w-full animate-pulse rounded bg-brand-600/10 motion-reduce:animate-none" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-brand-600/10 motion-reduce:animate-none" />
          </Card.Content>
        </Card>
      </div>
    );
  }

  const isError = state === "error";
  const Icon = isError ? FiAlertCircle : FiInbox;

  return (
    <div role="status">
      <Card className="site-card h-full border border-dashed border-brand-600/30">
        <Card.Content className="flex h-full flex-col justify-center gap-5 p-7 sm:p-9">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-700 dark:bg-brand-700/25 dark:text-brand-400"
            >
              <Icon className="size-5" />
            </span>
            <Typography.Paragraph className="text-sm leading-7 text-muted">
              {isError
                ? error || "No se pudieron cargar los planes en este momento."
                : "Actualmente no hay planes empresariales publicados. Puedes solicitar acceso para evaluación."}
            </Typography.Paragraph>
          </div>
          {isError && onRetry ? (
            <div>
              <Button
                isDisabled={isFetching}
                isPending={isFetching}
                variant="secondary"
                onPress={onRetry}
              >
                <FiRefreshCw aria-hidden="true" className="size-4" />
                Reintentar
              </Button>
            </div>
          ) : null}
        </Card.Content>
      </Card>
    </div>
  );
}
