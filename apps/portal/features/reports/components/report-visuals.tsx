"use client";
import type { ReactNode } from "react";
import { Table } from "@heroui/react";
export function ReportMetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: ReactNode;
  description?: string;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-sm text-muted">{title}</h3>
      <p className="mt-2 break-words text-2xl font-semibold tabular-nums">{value}</p>
      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
      ) : null}
    </article>
  );
}
export function ReportChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}
export function ReportEmptyState({
  children = "Sin datos para los filtros aplicados.",
}: {
  children?: ReactNode;
}) {
  return (
    <p className="rounded-xl bg-surface-secondary p-4 text-sm leading-relaxed text-muted">
      {children}
    </p>
  );
}
export function ReportBars({
  title,
  rows,
  sort = true,
}: {
  title: string;
  rows: { label: string; value: number; suffix?: string }[];
  sort?: boolean;
}) {
  const ordered = sort ? [...rows].sort((a, b) => b.value - a.value) : rows;
  const max = Math.max(1, ...ordered.map((row) => row.value));
  return (
    <ReportChartCard title={title}>
      {ordered.some((row) => row.value > 0) ? (
        <ul className="space-y-4">
          {ordered.map((row, index) => (
            <li key={row.label + index} title={row.label + ": " + row.value + (row.suffix ?? "")}>
              <div className="mb-1.5 flex justify-between gap-3 text-sm">
                <span className="break-words">{row.label}</span>
                <strong className="shrink-0 tabular-nums">
                  {row.value}
                  {row.suffix}
                </strong>
              </div>
              <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-default">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: (100 * row.value) / max + "%" }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ReportEmptyState />
      )}
    </ReportChartCard>
  );
}
export const seriesColors = ["bg-success", "bg-danger", "bg-warning", "bg-accent"];
export function ReportDistribution({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: { label: string; value: number }[];
  emptyText?: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <ReportChartCard title={title}>
      {total > 0 ? (
        <>
          <div className="flex h-4 overflow-hidden rounded-full bg-default" aria-hidden="true">
            {rows.map((row, index) => (
              <span
                key={row.label}
                className={seriesColors[index % seriesColors.length]}
                style={{ width: (100 * row.value) / total + "%" }}
              />
            ))}
          </div>
          <ul className="space-y-2">
            {rows.map((row, index) => (
              <li key={row.label} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className={
                    "size-2 shrink-0 rounded-full " + seriesColors[index % seriesColors.length]
                  }
                />
                <span className="min-w-0 flex-1 break-words">{row.label}</span>
                <strong className="tabular-nums">{row.value}</strong>
                <span className="w-16 text-right text-xs tabular-nums text-muted">
                  {((100 * row.value) / total).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ReportEmptyState>{emptyText}</ReportEmptyState>
      )}
    </ReportChartCard>
  );
}
export function ReportDataTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: { id: string; cells: (string | number)[] }[];
}) {
  return (
    <ReportChartCard title={title}>
      <Table>
        <Table.ScrollContainer className="overflow-x-auto">
          <Table.Content aria-label={title} className="min-w-[560px]">
            <Table.Header>
              {columns.map((column, index) => (
                <Table.Column key={column} id={String(index)} isRowHeader={index === 0}>
                  {column}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body renderEmptyState={() => <ReportEmptyState />}>
              {rows.map((row) => (
                <Table.Row key={row.id} id={row.id}>
                  {row.cells.map((cell, index) => (
                    <Table.Cell key={index}>{cell}</Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </ReportChartCard>
  );
}
