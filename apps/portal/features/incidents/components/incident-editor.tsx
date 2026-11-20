"use client";
import type { FormEvent } from "react";
import type { z } from "zod";
import type { incidentRecord } from "../schema";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Autocomplete,
  Button,
  Input,
  Label,
  ListBox,
  SearchField,
  TextArea,
  TextField,
} from "@heroui/react";
import { ErrorState, FormNotice, LoadingState, PagePagination } from "@agrocloud/ui";
import { CreationDrawer } from "@/components/creation-drawer";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { incidentInput, incidentUpdate, incidentLabels } from "../schema";
import { fetchIncidentHistory, saveIncident } from "../api";
import { useIncidentOptions } from "../hooks";
export function IncidentEditor({
  incident,
  lotId,
}: {
  incident?: z.infer<typeof incidentRecord>;
  lotId?: number;
}) {
  const { data: actor } = useCurrentUser();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [responsible, setResponsible] = useState("");
  const [evidence, setEvidence] = useState("");
  const [severity, setSeverity] = useState("MEDIA");
  const [state, setState] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const lot = incident?.id_lote ?? lotId ?? 0;
  const supervisor =
    actor?.rol?.codigo === "SUPERVISOR" && canManageCompany(actor, "incidencias.cerrar");
  const states = !incident
    ? []
    : incident.estado === "ABIERTA"
      ? ["EN_ATENCION"]
      : incident.estado === "EN_ATENCION"
        ? ["RESUELTA"]
        : supervisor
          ? incident.estado === "RESUELTA"
            ? ["CERRADA", "EN_ATENCION"]
            : ["ABIERTA"]
          : [];
  const allowed = incident
    ? canManageCompany(actor, "incidencias.ver") &&
      (supervisor || actor?.id_usuario === incident.responsable) &&
      states.length > 0
    : canManageCompany(actor, "incidencias.crear") &&
      ["ADMIN", "RECEPCION", "INSPECTOR", "SUPERVISOR"].includes(actor?.rol?.codigo ?? "");
  const options = useIncidentOptions(lot, !incident, open && allowed);
  const history = useQuery({
    queryKey: ["agricultural", "incident-history", incident?.id, historyPage],
    queryFn: ({ signal }) => fetchIncidentHistory(incident!.id, historyPage, signal),
    enabled: open && Boolean(incident),
    retry: false,
  });
  const save = useMutation({
    mutationFn: (body: object) => saveIncident(lot, body, incident?.id),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ["agricultural"] });
      setOpen(false);
    },
    retry: false,
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (save.isPending) return;
    const fields = new FormData(event.currentTarget);
    const text = (name: string) => String(fields.get(name) ?? "").trim();
    const parsed = incident
      ? incidentUpdate.safeParse({
          estado: state,
          accion: text("accion"),
          comprobacion: ["RESUELTA", "CERRADA"].includes(state) ? text("comprobacion") : undefined,
          evidencia: evidence ? Number(evidence) : undefined,
        })
      : incidentInput.safeParse({
          titulo: text("titulo"),
          descripcion: text("descripcion"),
          gravedad: severity,
          responsable: Number(responsible),
        });
    setError(parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos."));
    if (parsed.success) save.mutate(parsed.data);
  }
  if (!allowed && !incident) return null;
  return (
    <CreationDrawer
      open={open}
      onOpenChange={setOpen}
      busy={save.isPending}
      title={incident ? incident.titulo : "Registrar incidencia"}
      description={
        incident
          ? "Revisa el historial y registra las acciones de seguimiento."
          : "Asigna un responsable activo y describe el problema del lote."
      }
      trigger={
        <Button
          variant="secondary"
          onPress={() => {
            setState(states[0] ?? "");
            setResponsible("");
            setEvidence("");
            setError("");
            setHistoryPage(1);
            save.reset();
            setOpen(true);
          }}
        >
          {incident ? "Ver seguimiento" : "Registrar incidencia"}
        </Button>
      }
    >
      {incident ? (
        <>
          <p className="mb-3 text-sm text-muted">
            {incident.descripcion} · {incidentLabels[incident.estado]} · Gravedad{" "}
            {incidentLabels[incident.gravedad]?.toLocaleLowerCase("es")}
          </p>
          <h3 className="mb-3 font-semibold">Historial de seguimiento</h3>
          {history.isPending ? (
            <LoadingState label="Cargando historial" />
          ) : history.isError ? (
            <ErrorState error={history.error} retry={() => history.refetch()} />
          ) : (
            <>
              <ol className="mb-4 space-y-3 border-l-2 border-border pl-4">
                {history.data.data.map((item) => {
                  let changes: Record<string, unknown> = {};
                  try {
                    changes =
                      typeof item.cambios === "string" ? JSON.parse(item.cambios) : item.cambios;
                  } catch {
                    /* Un evento histórico puede carecer de detalle válido. */
                  }
                  return (
                    <li key={item.id}>
                      <p className="font-medium">
                        {item.evento === "INCIDENCIA_ABIERTA"
                          ? "Incidencia registrada"
                          : "Seguimiento actualizado"}
                      </p>
                      <time className="text-xs text-muted" dateTime={item.created_at}>
                        {new Date(item.created_at).toLocaleString("es-PE")}
                      </time>
                      {["accion", "comprobacion"].map((key) =>
                        typeof changes[key] === "string" ? (
                          <p key={key} className="text-sm">
                            {String(changes[key])}
                          </p>
                        ) : null,
                      )}
                    </li>
                  );
                })}
              </ol>
              <PagePagination
                page={historyPage}
                last={history.data.last_page}
                onChange={setHistoryPage}
              />
            </>
          )}
        </>
      ) : null}
      {allowed ? (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <fieldset disabled={save.isPending} className="space-y-4">
            {incident ? (
              <>
                <CatalogSelect
                  label="Siguiente estado"
                  value={state}
                  onChange={setState}
                  disabled={save.isPending}
                  items={states.map((id) => ({ id, name: incidentLabels[id] }))}
                />
                <TextField name="accion" isRequired isDisabled={save.isPending}>
                  <Label>Acción realizada</Label>
                  <TextArea maxLength={3000} />
                </TextField>
                {["RESUELTA", "CERRADA"].includes(state) ? (
                  <TextField name="comprobacion" isRequired isDisabled={save.isPending}>
                    <Label>Comprobación del resultado</Label>
                    <TextArea maxLength={1500} />
                  </TextField>
                ) : null}
                {options.evidences.isError ? (
                  <ErrorState
                    error={options.evidences.error}
                    retry={() => options.evidences.refetch()}
                  />
                ) : (
                  <>
                    <CatalogSelect
                      label="Evidencia del lote"
                      value={evidence}
                      onChange={setEvidence}
                      optional
                      emptyLabel="Sin evidencia adjunta"
                      disabled={save.isPending || options.evidences.isPending}
                      items={(options.evidences.data?.pages.flatMap((page) => page.data) ?? []).map(
                        (item) => ({
                          id: String(item.id_evidencia),
                          name: `${item.fruto?.codigo ?? "Fruto " + item.fruto?.numero} · Inspección ${item.id_inspeccion} · Fotografía ${item.id_evidencia}`,
                        }),
                      )}
                    />
                    {options.evidences.hasNextPage ? (
                      <Button
                        isPending={options.evidences.isFetchingNextPage}
                        onPress={() => void options.evidences.fetchNextPage()}
                      >
                        Cargar más fotografías
                      </Button>
                    ) : null}
                  </>
                )}
              </>
            ) : (
              <>
                <TextField name="titulo" isRequired isDisabled={save.isPending}>
                  <Label>Título</Label>
                  <Input maxLength={150} />
                </TextField>
                <TextField name="descripcion" isRequired isDisabled={save.isPending}>
                  <Label>Descripción</Label>
                  <TextArea maxLength={3000} />
                </TextField>
                <CatalogSelect
                  label="Gravedad"
                  value={severity}
                  onChange={setSeverity}
                  disabled={save.isPending}
                  items={["BAJA", "MEDIA", "ALTA", "CRITICA"].map((id) => ({
                    id,
                    name: incidentLabels[id],
                  }))}
                />
                {options.users.isPending ? (
                  <LoadingState label="Cargando responsables" />
                ) : options.users.isError ? (
                  <ErrorState error={options.users.error} retry={() => options.users.refetch()} />
                ) : (
                  <>
                    <Autocomplete
                      value={responsible || null}
                      onChange={(key) => setResponsible(typeof key === "string" ? key : "")}
                      isRequired
                      isDisabled={save.isPending}
                    >
                      <Label>Responsable</Label>
                      <Autocomplete.Trigger>
                        <Autocomplete.Value />
                        <Autocomplete.Indicator />
                      </Autocomplete.Trigger>
                      <Autocomplete.Popover>
                        <Autocomplete.Filter>
                          <SearchField aria-label="Buscar responsable">
                            <SearchField.Group>
                              <SearchField.SearchIcon />
                              <SearchField.Input placeholder="Buscar por nombre" />
                            </SearchField.Group>
                          </SearchField>
                          <ListBox aria-label="Responsables activos">
                            {(options.users.data?.pages.flatMap((page) => page.data) ?? []).map(
                              (user) => (
                                <ListBox.Item
                                  key={user.id}
                                  id={String(user.id)}
                                  textValue={user.name}
                                >
                                  {user.name}
                                </ListBox.Item>
                              ),
                            )}
                          </ListBox>
                        </Autocomplete.Filter>
                      </Autocomplete.Popover>
                    </Autocomplete>
                    {options.users.hasNextPage ? (
                      <Button
                        isPending={options.users.isFetchingNextPage}
                        onPress={() => void options.users.fetchNextPage()}
                      >
                        Cargar más responsables
                      </Button>
                    ) : null}
                  </>
                )}
              </>
            )}
          </fieldset>
          {error || save.isError ? <FormNotice message={error || save.error?.message} /> : null}
          <Button type="submit" isPending={save.isPending}>
            Guardar seguimiento
          </Button>
        </form>
      ) : null}
    </CreationDrawer>
  );
}
