"use client";

import { Label, Meter } from "@heroui/react";

type QuotaMeterProps = {
  label: string;
  used: number;
  limit: number;
  className?: string;
};

/** Use for subscription quotas, not asynchronous job progress. */
export function QuotaMeter({ label, used, limit, className = "" }: QuotaMeterProps) {
  const safeLimit = Math.max(1, limit);
  const safeUsed = Math.max(0, used);
  const ratio = safeUsed / safeLimit;
  const color = ratio >= 1 ? "danger" : ratio >= 0.8 ? "warning" : "accent";

  return (
    <Meter className={`w-full ${className}`} value={Math.min(safeUsed, safeLimit)} maxValue={safeLimit} color={color}>
      <Label>{label}</Label>
      <Meter.Output>{safeUsed.toLocaleString("es-PE")} / {Math.max(0, limit).toLocaleString("es-PE")}</Meter.Output>
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}
