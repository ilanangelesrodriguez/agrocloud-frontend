"use client";
import type { ReactNode } from "react";
import { Button, Input, Label, TextField, Tabs } from "@heroui/react";
export function matchesSearch(values: (string | number | null | undefined)[], search: string) {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es");
  return normalize(values.filter((value) => value != null).join(" ")).includes(
    normalize(search.trim()),
  );
}
export function AdminFilterBar({
  search,
  onSearch,
  status,
  onStatus,
  states,
  placeholder = "Buscar registros",
  children,
  scope = "page",
  onClear,
}: {
  search: string;
  onSearch: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  states: { id: string; label: string }[];
  placeholder?: string;
  children?: ReactNode;
  scope?: "page" | "all";
  onClear?: () => void;
}) {
  return (
    <section
      className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-5"
      aria-label="Filtros del listado"
    >
      <div className="flex flex-col items-end gap-3 sm:flex-row">
        <TextField variant="secondary" value={search} onChange={onSearch} className="w-full">
          <Label>Buscar{scope === "page" ? " en esta página" : ""}</Label>
          <Input variant="secondary" placeholder={placeholder} />
        </TextField>
        <Button
          variant="secondary"
          onPress={() => {
            onSearch("");
            onStatus("all");
            onClear?.();
          }}
        >
          Limpiar filtros
        </Button>
      </div>
      {children}
      <Tabs
        variant="secondary"
        selectedKey={status}
        onSelectionChange={(key) => onStatus(String(key))}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Filtrar por estado">
            {states.map((state) => (
              <Tabs.Tab key={state.id} id={state.id}>
                {state.label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
      <p className="text-xs text-muted">
        {scope === "page"
          ? "La búsqueda, los indicadores y los filtros corresponden a la página cargada. Consulta las demás páginas para revisar otros registros."
          : "Los filtros se aplican a todas las ofertas recibidas del servicio."}
      </p>
    </section>
  );
}
