import { Skeleton, Spinner } from "@heroui/react";

type LoadingStateProps = {
  label?: string;
  variant?: "spinner" | "skeleton";
  lines?: number;
  className?: string;
};

/** Spinner para una acción breve; Skeleton para una sección que todavía no carga. */
export function LoadingState({
  label = "Cargando información",
  variant = "skeleton",
  lines = 3,
  className = "",
}: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div role="status" aria-label={label} className={`flex items-center justify-center gap-3 py-8 ${className}`}>
        <Spinner size="md" color="accent" />
        <span className="text-sm text-muted">{label}</span>
      </div>
    );
  }

  return (
    <div role="status" aria-label={label} aria-busy="true" className={`grid gap-3 ${className}`}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: Math.max(1, Math.min(lines, 8)) }, (_, index) => (
        <Skeleton
          key={index}
          animationType="pulse"
          className={`h-4 rounded-md ${index === 0 ? "w-2/5" : index % 2 ? "w-full" : "w-4/5"}`}
        />
      ))}
    </div>
  );
}
