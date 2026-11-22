"use client";

import { useState } from "react";
import { Button, Label, Switch, toast, Form, ScrollShadow } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorState, FormNotice, InlineNotice, LoadingState } from "@agrocloud/ui";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { fetchPreferences, savePreferences } from "../api";
import { kindLabels } from "../schema";
import type { NotificationPreferences } from "../schema";

export function NotificationPreferencesPanel() {
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
    <section
      id="preferences"
      aria-labelledby="notification-preferences-heading"
      className="flex min-w-0 scroll-mt-24 flex-col gap-5 rounded-2xl border border-border bg-surface p-5 lg:min-h-0 lg:overflow-hidden sm:p-6"
    >
      <div className="shrink-0">
        <h2 id="notification-preferences-heading" className="text-lg font-semibold">
          Preferencias de avisos
        </h2>
        <p className="mt-1 text-sm text-muted">
          Elige los avisos opcionales y los correos que quieres recibir.
        </p>
      </div>
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
    <Form
      validationBehavior="native"
      className="flex min-w-0 flex-col gap-5 lg:min-h-0 lg:flex-1"
      onSubmit={(event) => {
        event.preventDefault();
        if (!save.isPending) save.mutate({ mutedKinds: muted, emailEnabled: email });
      }}
    >
      <div className="shrink-0">
        <InlineNotice
          status="accent"
          title="Avisos importantes"
          description="Los avisos importantes permanecen en tu bandeja. Los correos de seguridad y las confirmaciones de activación o compra se mantienen activos; los demás dependen de tu preferencia. El envío requiere que el servicio de correo esté habilitado."
        />
      </div>
      <div className="shrink-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <Switch isSelected={email} onChange={setEmail} isDisabled={save.isPending}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Recibir avisos por correo electrónico</Label>
          </Switch.Content>
        </Switch>
        <p className="mt-2 text-xs text-muted">
          Activa o desactiva los correos de avisos opcionales. La bandeja de notificaciones sigue
          disponible.
        </p>
      </div>
      <div className="flex min-h-0 min-w-0 flex-col gap-3 lg:flex-1">
        <div className="shrink-0">
          <h2 className="text-base font-semibold">Tipos de aviso</h2>
          <p className="mt-1 text-xs text-muted">
            Selecciona los eventos de los que quieres recibir avisos opcionales.
          </p>
        </div>
        <ScrollShadow
          hideScrollBar
          size={28}
          className="min-w-0 overscroll-contain lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2"
          aria-label="Tipos de notificaciones configurables"
        >
          <div className="grid min-w-0 grid-cols-1 gap-3">
            {initial.optionalKinds.map((kind) => (
              <div
                key={kind}
                className="flex min-w-0 items-center rounded-xl border border-border bg-surface p-4 sm:min-h-20"
              >
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
        </ScrollShadow>
      </div>
      <div className="flex shrink-0 flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
        {save.error ? <FormNotice message={save.error.message} /> : null}
        <Button type="submit" variant="primary" isDisabled={save.isPending}>
          {save.isPending ? "Guardando…" : "Guardar preferencias"}
        </Button>
      </div>
    </Form>
  );
}
