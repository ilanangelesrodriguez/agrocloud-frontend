"use client";
import { invalidateOperationalQueries } from "@/features/agricultural/shared/invalidation";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Chip,
  Input,
  Label,
  TextField,
  toast,
  FieldError,
  Tabs,
  Dropdown,
  AlertDialog,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiPlus,
  FiCopy,
  FiMoreHorizontal,
  FiLayers,
  FiCheckCircle,
  FiPauseCircle,
} from "react-icons/fi";
import {
  EmptyState,
  ErrorState,
  FormNotice,
  InlineNotice,
  LoadingState,
  PageHeader,
  PagePagination,
} from "@agrocloud/ui";
import { CreationDrawer } from "@/components/creation-drawer";
import { useAllSamplingProcedures } from "@/features/samplings/hooks";
import { useAgriculturalSettingsAccess } from "../hooks";
import { toggleProcedure } from "../api";
import type { Procedure } from "../schema";
import { ProcedureForm } from "./procedure-form";
import { CatalogSelect } from "./catalog-select";

import { versionLabel, procedureKey, compareVersions } from "../procedure-display";

const base = "/settings/sampling-procedures";

export function ProcedureManager({
  initialCreate = false,
  id,
}: {
  initialCreate?: boolean;
  id?: string;
}) {
  const router = useRouter();
  const cache = useQueryClient();
  const { canReadProcedures, canWrite } = useAgriculturalSettingsAccess();
  const query = useAllSamplingProcedures(canReadProcedures);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [product, setProduct] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(initialCreate);
  const [source, setSource] = useState<Procedure>();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Procedure | null>(null);
  const toggle = useMutation({
    mutationFn: (item: Procedure) => toggleProcedure(item.id, !item.activo),
    retry: false,
    onSuccess: async () => {
      await invalidateOperationalQueries(cache);
      setConfirm(null);
      toast.success("Disponibilidad actualizada");
    },
  });
  const all = query.data?.data ?? [];
  const detail = all.find((item) => String(item.id) === id);
  const rows = all.filter(
    (item) =>
      [item.nombre, item.version, item.producto, item.metodo]
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(search.trim().toLocaleLowerCase("es")) &&
      (status === "all" || item.activo === (status === "active")) &&
      (!product || (product === "__general" ? !item.producto : item.producto === product)),
  );
  const groups = new Map<string, Procedure[]>();
  for (const item of rows) {
    const key = procedureKey(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  const versionCounts = new Map<string, number>();
  for (const item of all) {
    const key = procedureKey(item);
    versionCounts.set(key, (versionCounts.get(key) ?? 0) + 1);
  }
  const cards = Array.from(groups.values()).map(
    (group) =>
      [...group].sort((a, b) => Number(b.activo) - Number(a.activo) || compareVersions(a, b))[0]!,
  );
  const history = detail
    ? all.filter((item) => procedureKey(item) === procedureKey(detail)).sort(compareVersions)
    : [];
  const last = Math.max(1, Math.ceil(cards.length / 12));
  const current = Math.min(page, last);
  function closeCreate(next: boolean) {
    setCreating(next);
    if (!next) {
      setSource(undefined);
      if (initialCreate) router.replace(base);
    }
  }
  return (
    <section className="space-y-6">
      <PageHeader
        title="Procedimientos de muestreo"
        description={
          canWrite
            ? "Gestiona las instrucciones y versiones autorizadas para el muestreo de tu empresa."
            : "Consulta los procedimientos autorizados para el muestreo de tu empresa."
        }
        actions={
          canWrite ? (
            <Button
              variant="primary"
              onPress={() => {
                setSource(undefined);
                setCreating(true);
              }}
            >
              <FiPlus aria-hidden="true" /> Nuevo procedimiento
            </Button>
          ) : undefined
        }
      />
      {query.isPending ? (
        <LoadingState label="Cargando procedimientos" />
      ) : query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Versiones registradas", all.length],
              ["Activos", all.filter((item) => item.activo).length],
              ["Inactivos", all.filter((item) => !item.activo).length],
            ].map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <p className="text-sm text-muted">{label}</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{count}</p>
                </div>
                <span className="text-accent" aria-hidden="true">
                  {label === "Activos" ? (
                    <FiCheckCircle />
                  ) : label === "Inactivos" ? (
                    <FiPauseCircle />
                  ) : (
                    <FiLayers />
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="grid items-end gap-4 md:grid-cols-[2fr_1fr]">
            <TextField
              variant="secondary"
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            >
              <Label>Buscar procedimiento</Label>
              <Input variant="secondary" placeholder="Nombre, versión, producto o método" />
              <FieldError />
            </TextField>
            <CatalogSelect
              label="Producto"
              value={product}
              onChange={(value) => {
                setProduct(value);
                setPage(1);
              }}
              optional
              emptyLabel="Todos"
              items={[
                { id: "__general", name: "Sin producto específico" },
                ...Array.from(
                  new Set(
                    all
                      .map((item) => item.producto)
                      .filter((value): value is string => Boolean(value)),
                  ),
                ).map((value) => ({ id: value, name: value })),
              ]}
            />
          </div>
          <Tabs
            variant="secondary"
            selectedKey={status}
            onSelectionChange={(key) => {
              setStatus(String(key));
              setPage(1);
            }}
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Estado de los procedimientos">
                {[
                  ["all", "Todos"],
                  ["active", "Activos"],
                  ["inactive", "Inactivos"],
                ].map(([key, label]) => (
                  <Tabs.Tab key={key} id={key}>
                    {label}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          {!rows.length ? (
            <EmptyState
              title="No hay procedimientos"
              description={
                all.length
                  ? "Prueba otros filtros."
                  : canWrite
                    ? "Crea el primer procedimiento para habilitar el muestreo de tus lotes."
                    : "Todavía no hay procedimientos autorizados disponibles. Consulta con la administración de tu empresa."
              }
            />
          ) : (
            <div className="paginated-content">
              <p className="mb-4 text-xs text-muted" role="status">
                {cards.length}{" "}
                {cards.length === 1 ? "procedimiento encontrado" : "procedimientos encontrados"}. Se
                muestra una versión por nombre y producto; consulta el historial para ver las demás.
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                {cards.slice((current - 1) * 12, current * 12).map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={base + "/" + item.id}
                          className="break-words text-base font-semibold hover:text-accent"
                        >
                          {item.nombre}
                        </Link>
                        <p className="mt-1 text-sm text-muted">
                          {item.producto || "Todos los productos"} · {versionLabel(item.version)}
                        </p>
                      </div>
                      <Chip size="sm" variant="soft" color={item.activo ? "success" : "default"}>
                        {item.activo ? "Activo" : "Inactivo"}
                      </Chip>
                    </div>
                    <p className="text-sm text-muted">
                      {item.metodo} · Máximo {item.max_frutos}{" "}
                      {item.max_frutos === 1 ? "fruto" : "frutos"}
                    </p>
                    <p className="line-clamp-2 text-sm leading-relaxed">{item.criterio_muestra}</p>
                    {item.max_frutos === 1 || item.tamano_recomendado === 1 ? (
                      <p className="text-xs text-warning">
                        Muestra de un solo fruto: revisa las cantidades del protocolo.
                      </p>
                    ) : null}
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <Link
                        href={base + "/" + item.id}
                        className="inline-flex min-h-10 items-center rounded-xl border border-border px-3 text-sm font-medium text-accent"
                      >
                        Ver detalles
                      </Link>
                      {canWrite ? (
                        <Dropdown>
                          <Button
                            size="sm"
                            variant="tertiary"
                            isIconOnly
                            aria-label={"Acciones de " + item.nombre}
                          >
                            <FiMoreHorizontal aria-hidden="true" />
                          </Button>
                          <Dropdown.Popover>
                            <Dropdown.Menu
                              aria-label="Acciones del procedimiento"
                              onAction={(key) => {
                                if (key === "version") {
                                  setSource(item);
                                  setCreating(true);
                                } else {
                                  toggle.reset();
                                  setConfirm(item);
                                }
                              }}
                            >
                              <Dropdown.Item id="version" textValue="Nueva versión">
                                <Label>Nueva versión</Label>
                              </Dropdown.Item>
                              <Dropdown.Item
                                id="toggle"
                                textValue={item.activo ? "Desactivar" : "Activar"}
                              >
                                <Label>{item.activo ? "Desactivar" : "Activar"}</Label>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      ) : null}
                      <Link
                        href={base + "/" + item.id + "#version-history"}
                        className="w-full text-xs font-medium text-accent underline-offset-4 hover:underline"
                      >
                        Ver historial · {versionCounts.get(procedureKey(item)) ?? 1}{" "}
                        {(versionCounts.get(procedureKey(item)) ?? 1) === 1
                          ? "versión"
                          : "versiones"}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              <PagePagination page={current} last={last} onChange={setPage} />
            </div>
          )}
        </>
      )}
      <CreationDrawer
        open={creating && canWrite}
        onOpenChange={closeCreate}
        busy={busy}
        title={source ? "Nueva versión" : "Nuevo procedimiento"}
        description="Define las instrucciones y límites que aplicarán los inspectores."
        trigger={null}
      >
        <ProcedureForm
          key={source?.id ?? "new"}
          source={source}
          onBusyChange={setBusy}
          onSaved={() => {
            setPage(1);
            closeCreate(false);
          }}
        />
      </CreationDrawer>
      <CreationDrawer
        open={Boolean(id) && !creating}
        onOpenChange={(next) => {
          if (!next) router.push(base);
        }}
        title="Detalle del procedimiento"
        description="Consulta la versión autorizada y sus instrucciones."
        trigger={null}
        closeLabel="Volver al listado"
      >
        {query.isPending ? (
          <LoadingState label="Cargando procedimiento" />
        ) : query.isError ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : !detail ? (
          <EmptyState
            title="Procedimiento no encontrado"
            description="No está disponible en tu empresa."
          />
        ) : (
          <div className="space-y-5">
            <div>
              <Chip size="sm" variant="soft" color={detail.activo ? "success" : "default"}>
                {detail.activo ? "Activo" : "Inactivo"}
              </Chip>
              <h2 className="mt-3 break-words text-xl font-semibold">{detail.nombre}</h2>
              <p className="mt-1 text-sm text-muted">
                {detail.producto || "Todos los productos"} · {versionLabel(detail.version)}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 rounded-xl bg-default p-4 text-sm">
              {[
                ["Método", detail.metodo],
                ["Tamaño recomendado", detail.tamano_recomendado ?? "No definido"],
                ["Máximo de frutos", detail.max_frutos],
                ["Requiere población", detail.requiere_poblacion ? "Sí" : "No"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted">{label}</dt>
                  <dd className="mt-1 break-words font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {detail.max_frutos === 1 || detail.tamano_recomendado === 1 ? (
              <InlineNotice
                status="warning"
                title="Muestra de un solo fruto"
                description="Confirma que las cantidades corresponden al protocolo autorizado. AgroCloud no determina su representatividad."
              />
            ) : null}
            <div>
              <h3 className="font-semibold">Criterio de muestra</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {detail.criterio_muestra}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Selección de frutos</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {detail.seleccion_frutos}
              </p>
            </div>
            <details
              key={detail.id}
              id="version-history"
              open
              className="scroll-mt-4 rounded-xl border border-border p-4"
            >
              <summary className="cursor-pointer font-semibold">
                Historial de versiones ({history.length})
              </summary>
              <p className="mt-2 text-xs text-muted">
                Registros con el mismo nombre y producto. Puede haber varias versiones activas.
              </p>
              <ul className="mt-4 space-y-3">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3"
                  >
                    <Link className="text-sm font-medium text-accent" href={base + "/" + entry.id}>
                      {versionLabel(entry.version)}
                      {entry.id === detail.id ? " · En consulta" : ""}
                    </Link>
                    <Chip size="sm" variant="soft" color={entry.activo ? "success" : "default"}>
                      {entry.activo ? "Activa" : "Inactiva"}
                    </Chip>
                  </li>
                ))}
              </ul>
            </details>
            {canWrite ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onPress={() => {
                    setSource(detail);
                    setCreating(true);
                  }}
                >
                  <FiCopy aria-hidden="true" /> Nueva versión
                </Button>
                <Button
                  variant="secondary"
                  onPress={() => {
                    toggle.reset();
                    setConfirm(detail);
                  }}
                >
                  {detail.activo ? "Desactivar" : "Activar"}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </CreationDrawer>
      <AlertDialog
        isOpen={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open && !toggle.isPending) setConfirm(null);
        }}
      >
        <AlertDialog.Backdrop
          isDismissable={!toggle.isPending}
          isKeyboardDismissDisabled={toggle.isPending}
        >
          <AlertDialog.Container placement="center" size="sm">
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Icon status={confirm?.activo ? "warning" : "accent"} />
                <AlertDialog.Heading>
                  {confirm?.activo ? "¿Desactivar procedimiento?" : "¿Activar procedimiento?"}
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p className="mb-4 break-words">
                  {confirm?.nombre} · {confirm ? versionLabel(confirm.version) : ""}
                </p>
                <InlineNotice
                  status="accent"
                  title="Muestreos existentes"
                  description="Los muestreos registrados conservarán su procedimiento y versión. El cambio afecta a los nuevos muestreos."
                />
                {toggle.error ? <FormNotice message={toggle.error.message} /> : null}
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button variant="secondary" slot="close" isDisabled={toggle.isPending}>
                  Cancelar
                </Button>
                <Button
                  variant={confirm?.activo ? "danger" : "primary"}
                  isDisabled={toggle.isPending}
                  onPress={() => {
                    if (confirm) toggle.mutate(confirm);
                  }}
                >
                  {toggle.isPending ? "Guardando…" : "Confirmar cambio"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </section>
  );
}
