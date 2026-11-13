import type { ReactNode } from "react";

import { Typography } from "@heroui/react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

/** Encabezado visual compartido; solo debe haber un H1 por pantalla. */
export function PageHeader({ title, description, actions, className = "" }: PageHeaderProps) {
  return (
    <header className={`flex flex-wrap items-start justify-between gap-4 ${className}`.trim()}>
      <div className="min-w-0">
        <Typography.Heading className="text-[1.75rem] font-semibold tracking-tight" level={1}>
          {title}
        </Typography.Heading>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
