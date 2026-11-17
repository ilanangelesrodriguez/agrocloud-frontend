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
  lines = 5,
  className = "",
}: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div
        role="status"
        aria-label={label}
        aria-busy="true"
        className={`flex min-h-64 items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-8 ${className}`}
      >
        <Spinner size="md" color="accent" />
        <span className="text-sm text-muted">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={`min-h-96 space-y-6 rounded-2xl border border-border bg-surface p-5 sm:p-6 ${className}`}
    >
      <span className="sr-only">{label}</span>
      <div className="flex items-center justify-between gap-6">
        <Skeleton animationType="pulse" className="h-6 w-2/5 rounded-lg" />
        <Skeleton animationType="pulse" className="h-9 w-24 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: Math.max(1, Math.min(lines, 8)) }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-t border-border pt-4">
            <Skeleton animationType="pulse" className="size-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton
                animationType="pulse"
                className={`h-4 rounded-md ${index % 2 ? "w-3/5" : "w-2/5"}`}
              />
              <Skeleton animationType="pulse" className="h-3 w-4/5 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
