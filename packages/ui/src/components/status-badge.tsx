import type { ReactNode } from "react";

import { Chip } from "@heroui/react";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
};

/**
 * Adaptador semántico de AgroCloud al Chip de HeroUI v3.
 * El estado info usa tokens propios porque Chip no tiene color "info".
 */
export function StatusBadge({ children, tone = "neutral", className = "" }: StatusBadgeProps) {
  const color = tone === "neutral" || tone === "info" ? "default" : tone;
  const infoClasses = tone === "info" ? "bg-info-soft text-info-soft-foreground" : "";

  return (
    <Chip color={color} variant="soft" size="sm" className={`font-medium ${infoClasses} ${className}`.trim()}>
      {children}
    </Chip>
  );
}
