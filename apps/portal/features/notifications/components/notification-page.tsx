"use client";
import Link from "next/link";
import { ErrorState, InlineNotice, LoadingState, PageHeader } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { NotificationList } from "./notification-list";

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
    <section className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Revisa los avisos de tu empresa y continúa con las acciones que requieren tu atención."
        actions={
          <Link
            href="/settings/notifications"
            className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm font-medium text-accent"
          >
            Preferencias
          </Link>
        }
      />
      <div className="max-w-4xl">
        <NotificationList />
      </div>
    </section>
  );
}
