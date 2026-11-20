import type { ReactNode } from "react";
export function displayClass(value: string) {
  return value.replaceAll("_", " ").toLocaleLowerCase("es");
}
export function percent(value: number | null | undefined) {
  return value == null ? "No evaluable" : (100 * value).toFixed(2) + "%";
}
export function AiMetrics({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-card border border-border bg-surface p-5">
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className="mt-2 break-words text-2xl font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function AiBars({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number; suffix?: string }[];
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="space-y-3 rounded-card border border-border bg-surface p-5">
      <h2 className="font-semibold">{title}</h2>
      {rows.length ? (
        rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span>{row.label}</span>
              <strong>
                {row.value}
                {row.suffix ?? ""}
              </strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-default" aria-hidden="true">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(100 * row.value) / max}%` }}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted">Sin datos en este periodo.</p>
      )}
    </section>
  );
}
