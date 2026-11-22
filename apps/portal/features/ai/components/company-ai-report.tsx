"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, Tabs } from "@heroui/react";
import Link from "next/link";
import { ErrorState, InlineNotice, LoadingState } from "@agrocloud/ui";
import { OperationWorkspace } from "@/features/agricultural/shared/operation-workspace";
import { ReportFilters, useAnalysisFilter } from "@/features/reports/components/report-filters";
import {
  ReportBars,
  ReportChartCard,
  ReportDataTable,
  ReportDistribution,
  ReportEmptyState,
  ReportMetricCard,
} from "@/features/reports/components/report-visuals";
import { bffRequest } from "@/lib/api/bff-client";
import { companyAiProducers } from "../schema";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canReadModel } from "../policy";
import { companyOverview, companyClasses, companyDaily, companyModels } from "../schema";
import { useCompanyAi } from "../hooks";
import { displayClass } from "./ai-shared";
import { ModelPanel } from "./model-panel";
import { EvaluationPanel } from "./evaluation-panel";
export function CompanyAiReport() {
  return (
    <OperationWorkspace
      title="Inteligencia artificial · Mi empresa"
      description="Procesamiento de evidencias, detecciones propuestas y revisión humana de tu empresa."
      permission="ia.reportes.ver"
    >
      <CompanyAiContent />
    </OperationWorkspace>
  );
}
function CompanyAiContent() {
  const { data: actor } = useCurrentUser();
  if (!canReadModel(actor)) return <CompanyResults />;
  return (
    <Tabs variant="secondary" defaultSelectedKey="results" className="space-y-5">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Análisis de inteligencia artificial">
          <Tabs.Tab id="results">
            Resultados de mi empresa
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="model">
            Modelo configurado
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="evaluation">
            Evaluación histórica V2
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="results">
        <CompanyResults />
      </Tabs.Panel>
      <Tabs.Panel id="model">
        <ModelPanel />
      </Tabs.Panel>
      <Tabs.Panel id="evaluation">
        <EvaluationPanel />
      </Tabs.Panel>
    </Tabs>
  );
}
function CompanyResults() {
  const { data: actor } = useCurrentUser();
  const { filter, apply, revision } = useAnalysisFilter();
  const overview = useCompanyAi("overview", companyOverview, filter);
  const classes = useCompanyAi("classes", companyClasses, filter);
  const daily = useCompanyAi("daily", companyDaily, filter);
  const models = useCompanyAi("models", companyModels, {});
  const producers = useInfiniteQuery({
    queryKey: ["agricultural", "ai", "producers"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      bffRequest(
        "reports/ai/producers?page=" + pageParam,
        companyAiProducers,
        { signal },
        "agricultural",
      ),
    getNextPageParam: (page) =>
      page.meta.current_page < page.meta.last_page ? page.meta.current_page + 1 : undefined,
    staleTime: 60000,
    retry: false,
  });
  const options = producers.data?.pages.flatMap((page) => page.data) ?? [];
  const canReview = actor?.permissions.includes("inspecciones.ver");
  return (
    <section className="space-y-6">
      <ReportFilters
        key={revision}
        filter={filter}
        onApply={apply}
        producers={options.map((item) => ({
          id: String(item.id_productor),
          name: item.nombre_razon_social,
        }))}
        models={(models.data?.data ?? []).map((item) => ({
          id: item.model_id,
          name: item.model_id,
        }))}
        busy={overview.isFetching}
      >
        {producers.hasNextPage ? (
          <Button
            size="sm"
            variant="tertiary"
            isPending={producers.isFetchingNextPage}
            onPress={() => void producers.fetchNextPage()}
          >
            Cargar más productores
          </Button>
        ) : null}
        {producers.isError ? (
          <ErrorState error={producers.error} retry={() => producers.refetch()} />
        ) : null}
        {models.isError ? <ErrorState error={models.error} retry={() => models.refetch()} /> : null}
      </ReportFilters>
      <p className="text-xs leading-relaxed text-muted">
        Fechas UTC de registro de la evidencia; este periodo representa una población diferente al
        registro de lotes de Reportes de calidad. Se excluyen fotografías descartadas y validaciones
        de detecciones reemplazadas por otro análisis.
      </p>
      {overview.isPending ? (
        <LoadingState label="Consultando resultados IA de tu empresa" />
      ) : overview.isError ? (
        <ErrorState error={overview.error} retry={() => overview.refetch()} />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Procesamiento de evidencias</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <ReportMetricCard
                title="Evidencias registradas"
                value={overview.data.data.evidences}
              />
              <ReportMetricCard title="Evidencias analizadas" value={overview.data.data.analyzed} />
              <ReportMetricCard title="En cola o proceso" value={overview.data.data.processing} />
            </div>
          </section>
          {overview.data.data.failed > 0 ? (
            <section className="space-y-3 rounded-2xl border border-warning/40 bg-warning/5 p-5">
              <InlineNotice
                status="warning"
                title={
                  overview.data.data.failed === 1
                    ? "1 evidencia con error IA"
                    : overview.data.data.failed + " evidencias con error IA"
                }
                description="Revisa las evidencias afectadas antes de decidir si corresponde reintentar el análisis o continuar manualmente."
              />
              {canReview ? (
                <Link
                  className="inline-flex min-h-10 items-center text-sm font-semibold text-accent"
                  href="/inspections"
                >
                  Revisar inspecciones →
                </Link>
              ) : null}
            </section>
          ) : (
            <p className="text-xs text-muted">0 evidencias con error IA en el periodo aplicado.</p>
          )}
          <div className="grid items-start gap-4 lg:grid-cols-[1fr_2fr]">
            <ReportMetricCard
              title="Detecciones propuestas"
              value={overview.data.data.detections}
              description="Propuestas individuales generadas por IA; requieren interpretación y validación humana."
            />
            <section className="space-y-4 rounded-2xl border border-accent/30 bg-accent/5 p-5 sm:p-6">
              <h2 className="font-semibold">Revisión humana pendiente</h2>
              <p className="text-3xl font-semibold tabular-nums">{overview.data.data.pending}</p>
              <p className="text-sm text-muted">
                {overview.data.data.pending === 1
                  ? "Propuesta sin decisión humana."
                  : "Propuestas sin decisión humana."}
              </p>
              {canReview ? (
                <Link
                  className="inline-flex min-h-10 items-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground"
                  href="/inspections"
                >
                  Revisar evidencias →
                </Link>
              ) : null}
              <p className="text-xs text-muted">
                El acceso abre el listado de inspecciones. El resumen no identifica evidencias
                individuales ni ofrece un filtro directo de propuestas pendientes.
              </p>
            </section>
          </div>
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <ReportDistribution
              title="Validación humana de propuestas"
              rows={[
                { label: "Confirmadas", value: overview.data.data.confirmed },
                { label: "Descartadas", value: overview.data.data.discarded },
                { label: "Pendientes", value: overview.data.data.pending },
              ]}
              emptyText="Sin detecciones propuestas para revisar en este periodo."
            />
            <ReportBars
              title="Evidencias por estado de procesamiento"
              sort={false}
              rows={[
                { label: "Analizadas", value: overview.data.data.analyzed },
                { label: "En cola o proceso", value: overview.data.data.processing },
                { label: "Con error IA", value: overview.data.data.failed },
              ]}
            />
          </div>
        </>
      )}
      <InlineNotice
        status="accent"
        title="La validación humana no es una evaluación científica"
        description="Confirmar propuestas no demuestra precisión, recall ni mAP. No hay anotaciones sistemáticas de los objetos que el modelo pudo omitir."
      />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {classes.isPending ? (
          <LoadingState label="Cargando clases detectadas" />
        ) : classes.isError ? (
          <ErrorState error={classes.error} retry={() => classes.refetch()} />
        ) : (
          <ReportBars
            title="Detecciones propuestas por clase"
            rows={classes.data.data.map((item) => ({
              label: displayClass(item.class_name),
              value: item.detections,
            }))}
          />
        )}
        {daily.isPending ? (
          <LoadingState label="Cargando actividad diaria" />
        ) : daily.isError ? (
          <ErrorState error={daily.error} retry={() => daily.refetch()} />
        ) : (
          <ReportBars
            title="Evidencias analizadas por día (UTC)"
            sort={false}
            rows={[...daily.data.data]
              .sort((a, b) => a.day.localeCompare(b.day))
              .map((item) => ({ label: formatDay(item.day), value: item.analyzed }))}
          />
        )}
      </div>
      {classes.data ? (
        <>
          <ReportChartCard title="Validación humana por clase">
            {classes.data.data.length ? (
              <ul className="space-y-4">
                {classes.data.data.map((item) => {
                  const total = item.confirmed + item.discarded + item.pending;
                  return (
                    <li key={item.class_name}>
                      <h3 className="text-sm font-medium">{displayClass(item.class_name)}</h3>
                      <div
                        aria-hidden="true"
                        className="my-2 flex h-3 overflow-hidden rounded-full bg-default"
                      >
                        {[
                          { value: item.confirmed, color: "bg-success" },
                          { value: item.discarded, color: "bg-danger" },
                          { value: item.pending, color: "bg-warning" },
                        ].map((part, index) => (
                          <span
                            key={index}
                            className={part.color}
                            style={{ width: total > 0 ? (100 * part.value) / total + "%" : "0%" }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted">
                        Confirmadas: {item.confirmed} · Descartadas: {item.discarded} · Pendientes:{" "}
                        {item.pending}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ReportEmptyState />
            )}
          </ReportChartCard>
          <ReportDataTable
            title="Revisión por clase"
            columns={["Clase", "Propuestas", "Confirmadas", "Descartadas", "Pendientes"]}
            rows={classes.data.data.map((item) => ({
              id: item.class_name,
              cells: [
                displayClass(item.class_name),
                item.detections,
                item.confirmed,
                item.discarded,
                item.pending,
              ],
            }))}
          />
        </>
      ) : null}
    </section>
  );
}
function formatDay(day: string) {
  const date = new Date(day + "T00:00:00Z");
  return Number.isNaN(date.getTime())
    ? day
    : new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
}
