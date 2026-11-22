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
    return (
      <div aria-busy="true" className="h-full" role="status">
        <span className="sr-only">Cargando ofertas empresariales…</span>
        <Card className="site-card h-full border border-border">
          <Card.Content aria-hidden="true" className="space-y-5 p-6 sm:p-7">
            <div className="h-6 w-32 animate-pulse rounded-full bg-brand-600/10 motion-reduce:animate-none" />
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-brand-600/10 motion-reduce:animate-none" />
            <div className="h-16 w-full animate-pulse rounded-2xl bg-brand-600/10 motion-reduce:animate-none" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-18 animate-pulse rounded-xl bg-brand-600/10 motion-reduce:animate-none"
                />
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const isError = state === "error";
  const Icon = isError ? FiAlertCircle : FiInbox;

  return (
    <div className="h-full" role="status">
      <Card className="site-card h-full border border-dashed border-brand-600/30">
        <Card.Content className="flex h-full flex-col justify-center gap-4 p-6 sm:p-7">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-xl bg-brand-600/10 text-accent"
          >
            <Icon className="size-5" />
          </span>
          <Typography.Heading className="text-base font-semibold" level={2}>
            {isError ? "No pudimos cargar las ofertas" : "Sin ofertas de pago publicadas"}
          </Typography.Heading>
          <Typography.Paragraph className="text-sm leading-6 text-muted">
            {isError
              ? error || "Comprueba la conexión e inténtalo de nuevo."
              : "Actualmente puedes consultar el acceso gratuito. Las nuevas ofertas se mostrarán aquí cuando se publiquen."}
          </Typography.Paragraph>
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
