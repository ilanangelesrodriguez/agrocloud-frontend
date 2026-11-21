"use client";
import type { FormEvent } from "react";
import { DateRangeInput } from "@/components/date-range-input";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, Input, Label, TextField, Tabs, FieldError, Form } from "@heroui/react";
import { ErrorState, InlineNotice, LoadingState } from "@agrocloud/ui";
import { OperationWorkspace } from "@/features/agricultural/shared/operation-workspace";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
import { bffRequest } from "@/lib/api/bff-client";
import { companyAiProducers } from "../schema";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canReadModel } from "../policy";
import { companyOverview, companyClasses, companyDaily, companyModels } from "../schema";
import { useCompanyAi } from "../hooks";
import type { CompanyAiFilters } from "../api";
import { AiBars, AiMetrics, displayClass } from "./ai-shared";
import { ModelPanel } from "./model-panel";
import { EvaluationPanel } from "./evaluation-panel";
export function CompanyAiReport() {
  return (
    <OperationWorkspace
      title="Inteligencia artificial · Mi empresa"
      description="Resultados agrícolas y validaciones humanas de las evidencias de tu empresa."
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
  const [filter, setFilter] = useState<CompanyAiFilters>(() => ({
    from: new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  }));
  const [model, setModel] = useState("");
  const [producer, setProducer] = useState("");
  const [error, setError] = useState("");
  const overview = useCompanyAi("overview", companyOverview, filter);
  const classes = useCompanyAi("classes", companyClasses, filter);
  const daily = useCompanyAi("daily", companyDaily, filter);
  const models = useCompanyAi("models", companyModels, {});
  const producers = useInfiniteQuery({
    queryKey: ["agricultural", "ai", "producers"],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      bffRequest(
        `reports/ai/producers?page=${pageParam}`,
        companyAiProducers,
        { signal },
        "agricultural",
      ),
    getNextPageParam: (page) =>
      page.meta.current_page < page.meta.last_page ? page.meta.current_page + 1 : undefined,
    staleTime: 60000,
    retry: false,
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const next = Object.fromEntries(
      ["from", "to", "producto", "variedad"].map((name) => [
        name,
        String(fields.get(name) ?? "").trim() || undefined,
      ]),
    );
    if (next.from && next.to && next.from > next.to) {
      setError("Revisa el intervalo de fechas.");
      return;
    }
    setError("");
    setFilter({ ...next, model_id: model || undefined, producer_id: producer || undefined });
  }
  const options = producers.data?.pages.flatMap((page) => page.data) ?? [];
  return (
    <section className="space-y-5">
      <Form
        validationBehavior="native"
        onSubmit={submit}
        className="grid gap-3 rounded-card border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <DateRangeInput
          onChange={() => setError("")}
          initialFrom={filter.from}
          initialTo={filter.to}
          error={error || undefined}
        />
        {(
          [
            ["producto", "Producto histórico", "text"],
            ["variedad", "Variedad histórica", "text"],
          ] as const
        ).map(([name, label, type]) => (
          <TextField variant="secondary" key={name} name={name}>
            <Label>{label}</Label>
            <Input placeholder={String(label)} variant="secondary" type={type} maxLength={150} />
            <FieldError />
          </TextField>
        ))}
        <CatalogSelect
          label="Modelo"
          value={model}
          onChange={setModel}
          optional
          emptyLabel="Todos los modelos"
          items={(models.data?.data ?? []).map((item) => ({
            id: item.model_id,
            name: item.model_id,
          }))}
        />
        <CatalogSelect
          label="Productor"
          value={producer}
          onChange={setProducer}
          optional
          emptyLabel="Todos los productores"
          items={options.map((item) => ({
            id: String(item.id_productor),
            name: item.nombre_razon_social,
          }))}
        />
        {producers.hasNextPage ? (
          <Button
            isPending={producers.isFetchingNextPage}
            onPress={() => void producers.fetchNextPage()}
          >
            Cargar más productores
          </Button>
        ) : null}
        <Button type="submit" isPending={overview.isFetching}>
          Aplicar filtros
        </Button>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        {producers.isError ? (
          <ErrorState error={producers.error} retry={() => producers.refetch()} />
        ) : null}
        {models.isError ? <ErrorState error={models.error} retry={() => models.refetch()} /> : null}
      </Form>
      <p className="text-sm text-muted">
        Fechas UTC de registro de la evidencia. Se excluyen fotografías descartadas y validaciones
        de detecciones reemplazadas por otro análisis.
      </p>
      {overview.isPending ? (
        <LoadingState label="Consultando resultados IA de tu empresa" />
      ) : overview.isError ? (
        <ErrorState error={overview.error} retry={() => overview.refetch()} />
      ) : (
        <AiMetrics
          items={[
            { label: "Evidencias analizadas", value: overview.data.data.analyzed },
            { label: "Detecciones propuestas", value: overview.data.data.detections },
            { label: "Confirmadas por inspector", value: overview.data.data.confirmed },
            { label: "Descartadas por inspector", value: overview.data.data.discarded },
            { label: "Propuestas sin decisión", value: overview.data.data.pending },
            { label: "Evidencias en cola o proceso", value: overview.data.data.processing },
            { label: "Evidencias con error IA", value: overview.data.data.failed },
            { label: "Evidencias registradas", value: overview.data.data.evidences },
          ]}
        />
      )}
      <InlineNotice
        status="accent"
        title="La validación humana no es una evaluación científica"
        description="La proporción de propuestas confirmadas no permite calcular recall ni mAP: no contiene anotaciones sistemáticas de objetos omitidos."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {classes.isError ? (
          <ErrorState error={classes.error} retry={() => classes.refetch()} />
        ) : classes.data ? (
          <AiBars
            title="Propuestas confirmadas por clase"
            rows={classes.data.data.map((item) => ({
              label: displayClass(item.class_name),
              value: item.confirmed,
            }))}
          />
        ) : null}
        {daily.isError ? (
          <ErrorState error={daily.error} retry={() => daily.refetch()} />
        ) : daily.data ? (
          <AiBars
            title="Evidencias analizadas por día (UTC)"
            rows={daily.data.data.map((item) => ({ label: item.day, value: item.analyzed }))}
          />
        ) : null}
      </div>
      {classes.data ? (
        <section className="overflow-x-auto rounded-card border border-border bg-surface p-5">
          <h2 className="mb-3 font-semibold">Revisión por clase</h2>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Clase", "Propuestas", "Confirmadas", "Descartadas", "Pendientes"].map(
                  (title) => (
                    <th className="p-2 text-left" key={title}>
                      {title}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {classes.data.data.map((item) => (
                <tr key={item.class_name} className="border-t border-border">
                  <th scope="row" className="p-2 text-left font-medium">
                    {displayClass(item.class_name)}
                  </th>
                  <td className="p-2">{item.detections}</td>
                  <td className="p-2">{item.confirmed}</td>
                  <td className="p-2">{item.discarded}</td>
                  <td className="p-2">{item.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </section>
  );
}
