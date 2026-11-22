"use client";

import { ErrorState, InlineNotice, LoadingState, PageHeader } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { NotificationList } from "./notification-list";
import { NotificationPreferencesPanel } from "./notification-preferences";

export function NotificationPage() {
  const session = useCurrentUser();
  if (session.isPending) return <LoadingState label="Verificando acceso" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;
  if (!canManageCompany(session.data))
    return (
      <InlineNotice
        status="warning"
        title="Bandeja empresarial"
        description="Las notificaciones están disponibles para usuarios con empresa asignada."
      />
    );

  return (
    <section className="flex min-w-0 flex-col gap-6 lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <div className="shrink-0">
        <PageHeader
          title="Notificaciones"
          description="Consulta los avisos de tu empresa y configura cómo quieres recibirlos."
        />
      </div>
      <div className="grid min-w-0 gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <section
          aria-label="Bandeja de notificaciones"
          className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-surface p-5 lg:min-h-0 lg:overflow-hidden sm:p-6"
        >
          <NotificationList />
        </section>
        <NotificationPreferencesPanel />
      </div>
    </section>
  );
}
