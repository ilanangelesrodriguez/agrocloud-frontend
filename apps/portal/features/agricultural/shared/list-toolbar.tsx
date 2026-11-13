"use client";

import { Button, Input, Label, ListBox, Select, TextField } from "@heroui/react";

export function ListToolbar({
  search,
  onSearchChange,
  placeholder,
  status,
  onStatusChange,
  statuses = [],
  onRefresh,
  refreshing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  status?: string;
  onStatusChange?: (status: string) => void;
  statuses?: { value: string; label: string }[];
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-card border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <TextField className="w-full" value={search} onChange={onSearchChange}>
        <Label>Buscar en la página cargada</Label>
        <Input className="w-full" placeholder={placeholder} />
      </TextField>
      <div className="flex flex-wrap items-end gap-2">
        {onStatusChange ? (
          <Select
            aria-label="Filtrar por estado"
            className="min-w-44"
            placeholder="Todos los estados"
            value={status || null}
            onChange={(value) => onStatusChange(typeof value === "string" ? value : "")}
          >
            <Label>Estado</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox aria-label="Estados de lotes">
                <ListBox.Item id="all" textValue="Todos los estados">
                  Todos los estados
                </ListBox.Item>
                {statuses.map((option) => (
                  <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
                    {option.label}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        ) : null}
        <Button isDisabled={refreshing} size="sm" variant="secondary" onPress={onRefresh}>
          {refreshing ? "Actualizando…" : "Actualizar"}
        </Button>
        {search || status ? (
          <Button
            size="sm"
            variant="tertiary"
            onPress={() => {
              onSearchChange("");
              onStatusChange?.("");
            }}
          >
            Limpiar filtros
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted sm:col-span-2">
        La búsqueda y el filtro actúan únicamente sobre la página que devolvió el servidor. Cambia
        de página para consultar otros registros.
      </p>
    </div>
  );
}
