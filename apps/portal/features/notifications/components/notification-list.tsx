"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, toast } from "@heroui/react";
import { EmptyState, ErrorState, FormNotice, LoadingState } from "@agrocloud/ui";
import { useNotifications, useReadNotification, useUnreadNotifications } from "../hooks";
import { notificationDestination } from "../utils";
import type { Notification } from "../schema";

export function NotificationList({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [unread, setUnread] = useState(false);
  const query = useNotifications(unread, true);
  const read = useReadNotification();
  const count = useUnreadNotifications(true);
  const rows = Array.from(
    new Map(
      (query.data?.pages.flatMap((page) => page.data) ?? []).map((item) => [item.id, item]),
    ).values(),
  );
  async function open(item: Notification) {
    if (read.isPending) return;
    if (!item.read_at) {
      try {
        await read.mutateAsync(item.id);
      } catch {
        return;
      }
    }
    onNavigate?.();
    router.push(notificationDestination(item.destination));
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Filtrar notificaciones"
          className="flex gap-1 rounded-xl bg-default p-1"
        >
          {[false, true].map((value) => (
            <Button
              key={String(value)}
              size="sm"
              variant={unread === value ? "secondary" : "tertiary"}
              aria-pressed={unread === value}
              onPress={() => setUnread(value)}
            >
              {value ? "Sin leer" : "Todas"}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant="tertiary"
          isDisabled={read.isPending || count.data?.unreadCount === 0}
          onPress={() =>
            read.mutate(undefined, {
              onSuccess: () => toast.success("Notificaciones marcadas como leídas"),
            })
          }
        >
          Leer todas
        </Button>
      </div>
      {count.data ? (
        <p className="text-xs text-muted" aria-live="polite">
          {count.data.unreadCount} notificaciones sin leer
        </p>
      ) : null}
      {read.error ? <FormNotice message={read.error.message} /> : null}
      {query.isPending ? (
        <LoadingState label="Cargando notificaciones" lines={3} />
      ) : query.isError && !rows.length ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : !rows.length ? (
        <EmptyState
          title={unread ? "Estás al día" : "Tu bandeja está vacía"}
          description={
            unread
              ? "No tienes notificaciones pendientes de lectura."
              : "Los avisos de tu empresa aparecerán aquí."
          }
        />
      ) : (
        <>
          <ul
            className={
              compact ? "max-h-96 space-y-2 overflow-y-auto overscroll-contain pr-1" : "space-y-3"
            }
          >
            {rows.map((item) => (
              <li
                key={item.id}
                className={`rounded-xl border p-4 ${item.read_at ? "border-border bg-surface" : "border-accent/25 bg-accent/5"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 break-words text-sm font-semibold">{item.title}</h3>
                  {!item.read_at ? (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                      aria-label="Sin leer"
                    />
                  ) : null}
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
                  {item.message}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Chip
                    size="sm"
                    variant="soft"
                    color={
                      item.priority === "critical"
                        ? "danger"
                        : item.priority === "high"
                          ? "warning"
                          : "default"
                    }
                  >
                    {item.category === "security"
                      ? "Seguridad"
                      : item.category === "billing"
                        ? "Facturación"
                        : "Operaciones"}
                    {item.priority === "critical"
                      ? " · Crítica"
                      : item.priority === "high"
                        ? " · Prioridad alta"
                        : ""}
                  </Chip>
                  <time dateTime={item.created_at} className="text-xs text-muted">
                    {new Date(item.created_at).toLocaleString("es-PE", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </time>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    isDisabled={read.isPending}
                    onPress={() => void open(item)}
                  >
                    Abrir aviso
                  </Button>
                  {!item.read_at ? (
                    <Button
                      size="sm"
                      variant="tertiary"
                      isDisabled={read.isPending}
                      onPress={() => read.mutate(item.id)}
                    >
                      Marcar leída
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {query.hasNextPage ? (
            <Button
              variant="secondary"
              isDisabled={query.isFetchingNextPage}
              onPress={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? "Cargando…" : "Cargar más"}
            </Button>
          ) : null}
          {query.isFetchNextPageError ? (
            <ErrorState size="compact" error={query.error} retry={() => query.fetchNextPage()} />
          ) : null}
          {query.isRefetchError ? (
            <ErrorState
              size="compact"
              title="No se pudo actualizar la bandeja"
              error={query.error}
              retry={() => query.refetch()}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
