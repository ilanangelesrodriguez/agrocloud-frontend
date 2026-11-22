"use client";
import type { ReactNode } from "react";

import { useEffect, useState, type FormEvent } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, ComboBox, Input, Label, ListBox, Form } from "@heroui/react";

import { DateRangeInput } from "@/components/date-range-input";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import { bffRequest } from "@/lib/api/bff-client";
import { lotList } from "@/features/agricultural/schema";
export type AnalysisFilter = {
  from?: string;
  to?: string;
  producto?: string;
  variedad?: string;
  producer_id?: string;
  model_id?: string;
};
const keys = ["from", "to", "producto", "variedad", "producer_id", "model_id"] as const;

export function recentPeriod(days = 30): AnalysisFilter {
  const end = new Date();
  const start = new Date(end);

  start.setUTCDate(start.getUTCDate() - days + 1);

  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}
function validDate(value: string | null) {
  return (
    !!value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value + "T00:00:00Z")) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value
  );
}
function readUrl() {
  const params = new URLSearchParams(window.location.search);

  if (!keys.some((key) => params.has(key)) && params.get("period") !== "all") return recentPeriod();
  const filter: AnalysisFilter = {};

  for (const key of keys) {
    const value = params.get(key)?.trim();

    if (value && value.length <= 150 && ((key !== "from" && key !== "to") || validDate(value)))
      filter[key] = value;
  }
  if (filter.from && filter.to && filter.from > filter.to) {
    delete filter.from;
    delete filter.to;
  }

  return filter;
}
export function useAnalysisFilter() {
  const [filter, setFilter] = useState<AnalysisFilter>(() => recentPeriod());
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    function restore() {
      setFilter(readUrl());
      setRevision((value) => value + 1);
    }
    restore();
    window.addEventListener("popstate", restore);

    return () => window.removeEventListener("popstate", restore);
  }, []);
  function apply(next: AnalysisFilter) {
    const url = new URL(window.location.href);

    for (const key of keys) {
      url.searchParams.delete(key);
      if (next[key]) url.searchParams.set(key, next[key]!);
    }
    url.searchParams.delete("period");
    if (!next.from && !next.to) url.searchParams.set("period", "all");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    setFilter(next);
    setRevision((value) => value + 1);
  }

  return { filter, apply, revision };
}
function SearchFilter({
  label,
  value,
  onChange,
  items,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: string[];
  disabled?: boolean;
}) {
  return (
    <ComboBox
      allowsCustomValue
      inputValue={value}
      isDisabled={disabled}
      menuTrigger="input"
      variant="secondary"
      onInputChange={onChange}
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        <Input
          maxLength={150}
          placeholder="Buscar o escribir valor histórico"
          variant="secondary"
        />
        <ComboBox.Trigger aria-label={"Mostrar opciones de " + label}>⌄</ComboBox.Trigger>
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox
          aria-label={label}
          renderEmptyState={() => "Sin sugerencias. Puedes escribir un valor histórico."}
        >
          {items
            .filter((item) => item.toLocaleLowerCase("es").includes(value.toLocaleLowerCase("es")))
            .map((item) => (
              <ListBox.Item key={item} id={item} textValue={item}>
                {item}
              </ListBox.Item>
            ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
export function ReportFilters({
  filter,
  onApply,
  producers,
  models,
  busy,
  exportAction,
  children,
}: {
  filter: AnalysisFilter;
  onApply: (next: AnalysisFilter) => void;
  producers: { id: string; name: string }[];
  models?: { id: string; name: string }[];
  busy?: boolean;
  exportAction?: ReactNode;
  children?: ReactNode;
}) {
  const [dates, setDates] = useState({ from: filter.from, to: filter.to });
  const [dateRevision, setDateRevision] = useState(0);
  const [period, setPeriod] = useState(() => {
    const matching = [7, 30, 90].find((days) => {
      const range = recentPeriod(days);

      return range.from === filter.from && range.to === filter.to;
    });

    return matching ? String(matching) : "custom";
  });
  const [product, setProduct] = useState(filter.producto ?? "");
  const [variety, setVariety] = useState(filter.variedad ?? "");
  const [producer, setProducer] = useState(filter.producer_id ?? "");
  const [model, setModel] = useState(filter.model_id ?? "");
  const [error, setError] = useState("");
  const { data: actor } = useCurrentUser();
  const enabled = canManageCompany(actor, "lotes.ver");
  const lots = useInfiniteQuery({
    queryKey: ["agricultural", "report-filter-lots"],
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      bffRequest("lots?page=" + pageParam, lotList, { signal }, "agricultural"),
    getNextPageParam: (page) =>
      page.meta.current_page < page.meta.last_page ? page.meta.current_page + 1 : undefined,
    staleTime: 60000,
    retry: false,
  });
  const records = enabled ? (lots.data?.pages.flatMap((page) => page.data) ?? []) : [];
  const products = Array.from(new Set(records.map((row) => row.producto))).sort((a, b) =>
    a.localeCompare(b, "es"),
  );
  const varieties = Array.from(
    new Set(
      records
        .filter((row) => row.producto === product)
        .map((row) => row.variedad)
        .filter((value): value is string => !!value),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dates.from && dates.to && dates.from > dates.to) {
      setError("La fecha final debe ser igual o posterior a la inicial.");

      return;
    }
    setError("");
    onApply({
      ...dates,
      producto: product.trim() || undefined,
      variedad: variety.trim() || undefined,
      producer_id: producer || undefined,
      ...(models ? { model_id: model || undefined } : {}),
    });
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-semibold">Filtros del reporte</h2>
      <Form
        className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-3"
        validationBehavior="native"
        onSubmit={submit}
      >
        <CatalogSelect
          items={[
            { id: "7", name: "Últimos 7 días" },
            { id: "30", name: "Últimos 30 días" },
            { id: "90", name: "Últimos 90 días" },
            { id: "custom", name: "Personalizado" },
          ]}
          label="Periodo rápido"
          value={period}
          onChange={(value) => {
            setPeriod(value);
            if (value !== "custom") {
              setDates(recentPeriod(Number(value)));
              setDateRevision((value) => value + 1);
              setError("");
            }
          }}
        />
        <DateRangeInput
          key={dateRevision}
          error={error || undefined}
          initialFrom={dates.from}
          initialTo={dates.to}
          onRangeChange={(next) => {
            setDates({
              from: next.from,
              to: next.to,
            });
            setPeriod("custom");
            setError("");
          }}
        />
        <SearchFilter
          items={products}
          label="Producto histórico"
          value={product}
          onChange={(value) => {
            setProduct(value);
            setVariety("");
          }}
        />
        <SearchFilter
          disabled={!product.trim()}
          items={varieties}
          label="Variedad histórica"
          value={variety}
          onChange={setVariety}
        />
        <CatalogSelect
          optional
          emptyLabel="Todos los productores"
          items={producers}
          label="Productor"
          value={producer}
          onChange={setProducer}
        />
        {models ? (
          <CatalogSelect
            optional
            emptyLabel="Todos los modelos"
            items={models}
            label="Modelo"
            value={model}
            onChange={setModel}
          />
        ) : null}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4 sm:col-span-2 lg:col-span-3">
          <Button isPending={busy} type="submit" variant="primary">
            Aplicar filtros
          </Button>
          <Button type="button" variant="secondary" onPress={() => onApply({})}>
            Limpiar filtros
          </Button>
          {exportAction}
        </div>
      </Form>
      <p className="text-xs leading-relaxed text-muted">
        Las sugerencias incluyen valores históricos de los lotes que puedes consultar. Puedes
        escribir otros valores históricos exactos; al cambiar producto se limpia la variedad.
      </p>
      {lots.hasNextPage ? (
        <Button
          isPending={lots.isFetchingNextPage}
          size="sm"
          variant="tertiary"
          onPress={() => void lots.fetchNextPage()}
        >
          Cargar más sugerencias históricas
        </Button>
      ) : null}
      {lots.isError ? (
        <p className="text-xs text-muted">
          No se pudieron cargar las sugerencias. Puedes escribir los filtros manualmente.
        </p>
      ) : null}
      {children}
      <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted" role="status">
        Aplicados: {filter.from ?? "Sin inicio"} → {filter.to ?? "Sin fin"} (UTC) ·{" "}
        {filter.producto ?? "Todos los productos"} · {filter.variedad ?? "Todas las variedades"} ·{" "}
        {filter.producer_id
          ? (producers.find((item) => item.id === filter.producer_id)?.name ??
            "Productor #" + filter.producer_id)
          : "Todos los productores"}
        {filter.model_id ? " · Modelo " + filter.model_id : ""}
      </p>
    </section>
  );
}
