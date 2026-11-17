import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-64 gap-3 rounded-2xl border border-dashed border-border bg-surface p-8 sm:p-12 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </section>
  );
}
