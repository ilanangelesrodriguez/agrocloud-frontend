"use client";

import type { ReactNode } from "react";

import { Card, Chip, Typography } from "@heroui/react";

type Props = {
  /** Número de secuencia (01, 02…). Úsalo cuando el orden importa. */
  number?: string;
  /** Ícono. Si se pasa, reemplaza al número en el recuadro. */
  icon?: ReactNode;
  title: string;
  description: string;
  tag?: string;
  /** Resalta la etiqueta en verde (por ejemplo, para funciones asistidas por IA). */
  accentTag?: boolean;
};

export function FeatureCard({ number, icon, title, description, tag, accentTag = false }: Props) {
  return (
    <Card className="site-card group h-full border border-brand-600/20 shadow-sm shadow-brand-700/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-600/40 hover:shadow-lg hover:shadow-brand-700/10">
      <Card.Content className="flex h-full flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span
            aria-hidden={icon ? "true" : undefined}
            className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600/10 font-mono font-semibold text-brand-700 transition-colors duration-200 group-hover:bg-brand-700 group-hover:text-white dark:bg-brand-700/25 dark:text-brand-400 dark:group-hover:text-white [&>svg]:size-5"
          >
            {icon ?? number}
          </span>
          {tag && (
            <Chip variant="soft" size="sm" color={accentTag ? "accent" : "default"}>
              {tag}
            </Chip>
          )}
        </div>
        <div className="space-y-3">
          <Typography.Heading level={3} className="text-lg">
            {title}
          </Typography.Heading>
          <Typography.Paragraph size="sm" color="muted" className="leading-7">
            {description}
          </Typography.Paragraph>
        </div>
      </Card.Content>
    </Card>
  );
}
