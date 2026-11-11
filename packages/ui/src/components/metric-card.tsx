import type { ReactNode } from "react";

import { Card } from "@heroui/react";

type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

/** Resumen legible de una métrica; no aplica colores de estado a cifras arbitrarias. */
export function MetricCard({ title, value, description, icon, className = "" }: MetricCardProps) {
  return (
    <Card className={`h-full border border-border bg-surface ${className}`}>
      <Card.Header className="flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <Card.Title className="text-sm font-medium text-muted">{title}</Card.Title>
          {description ? <Card.Description className="mt-1 text-xs">{description}</Card.Description> : null}
        </div>
        {icon ? <div aria-hidden="true" className="text-accent">{icon}</div> : null}
      </Card.Header>
      <Card.Content>
        <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">{value}</p>
      </Card.Content>
    </Card>
  );
}
