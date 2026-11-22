import type { ReactNode } from "react";
import { ReportBars } from "@/features/reports/components/report-visuals";
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
  return <ReportBars title={title} rows={rows} sort={false} />;
}
