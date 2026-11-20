"use client";
import { useState } from "react";
import { Button, Label, Switch, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorState, FormNotice, InlineNotice, LoadingState, PageHeader } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { fetchPreferences, savePreferences } from "../api";
import { kindLabels } from "../schema";
import type { NotificationPreferences } from "../schema";

export function NotificationPreferencesPage() {
  const session = useCurrentUser();
  const allowed = canManageCompany(session.data);
  const query = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: ({ signal }) => fetchPreferences(signal),
    enabled: allowed,
    retry: false,
  });
  if (session.isPending) return <LoadingState label="Verificando acceso" />;
  if (session.isError) return <ErrorState error={session.error} retry={() => session.refetch()} />;
  if (!allowed)
    return (
      <InlineNotice
        status="warning"
        title="Acceso restringido"
        description="Se requiere una cuenta empresarial."
      />
    );
  return (
    <section className="space-y-6">
      <PageHeader
        title="Preferencias de notificaciones"
        description="Elige qué avisos opcionales recibes y habilita las notificaciones por correo."
      />
      {query.isPending ? (
        <LoadingState label="Cargando preferencias" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : (
        <PreferencesEditor key={JSON.stringify(query.data)} initial={query.data} />
      )}
    </section>
  );
}
function PreferencesEditor({ initial }: { initial: NotificationPreferences }) {
  const cache = useQueryClient();
  const [email, setEmail] = useState(initial.emailEnabled);
  const [muted, setMuted] = useState(initial.mutedKinds);
  const save = useMutation({
    mutationFn: savePreferences,
    retry: false,
    onSuccess: (data) => {
      cache.setQueryData(["notifications", "preferences"], data);
      toast.success("Preferencias actualizadas");
    },
  });
  return (
    <form
      className="max-w-3xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!save.isPending) save.mutate({ mutedKinds: muted, emailEnabled: email });
      }}
    >
      <InlineNotice
        status="accent"
        title="Avisos importantes"
        description="Los avisos críticos y de seguridad permanecen activos. El correo se entrega cuando el servicio de envío está habilitado para tu empresa."
      />
      <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-5">
        <div className="py-5">
          <Switch isSelected={email} onChange={setEmail} isDisabled={save.isPending}>
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Label>Recibir avisos por correo electrónico</Label>
            </Switch.Content>
          </Switch>
        </div>
        {initial.optionalKinds.map((kind) => (
          <div key={kind} className="py-5">
            <Switch
              isSelected={!muted.includes(kind)}
              isDisabled={save.isPending}
              onChange={(enabled) =>
                setMuted((values) =>
                  enabled
                    ? values.filter((value) => value !== kind)
                    : [...values.filter((value) => value !== kind), kind],
                )
              }
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Label>{kindLabels[kind] ?? kind}</Label>
              </Switch.Content>
            </Switch>
          </div>
        ))}
      </div>
      {save.error ? <FormNotice message={save.error.message} /> : null}
      <Button type="submit" variant="primary" isDisabled={save.isPending}>
        {save.isPending ? "Guardando…" : "Guardar preferencias"}
      </Button>
    </form>
  );
}
