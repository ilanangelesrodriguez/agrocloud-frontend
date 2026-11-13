"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Checkbox, Input, Label, ListBox, Select, TextField, toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminRequest } from "@/features/admin/api";
import { AdminError, AdminPagination } from "@/features/admin/components/admin-ui";
import { procedurePage, samplingInput, samplingResponse } from "../sampling";

export function SamplingForm({ lotId, product }: { lotId: number; product: string }) {
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [workload, setWorkload] = useState(false);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["agricultural", "sampling-procedures", page],
    queryFn: ({ signal }) => adminRequest("sampling-procedures?page=" + page, procedurePage, { signal }, "agricultural"),
    retry: false,
  });
  const procedures = query.data?.data.filter((item) => item.activo && (!item.producto || item.producto === product)) ?? [];
  const procedure = procedures.find((item) => String(item.id) === selected);
  const save = useMutation({
    mutationFn: (input: object) => adminRequest("lots/" + lotId + "/samplings", samplingResponse, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
    }, "agricultural"),
    onSuccess: async () => {
      toast.success("Muestreo registrado");
      await cache.invalidateQueries({ queryKey: ["agricultural", "lots"] });
    },
    retry: false,
  });

  function choose(value: string) {
    setSelected(value);
    setConfirmed(false);
    setWorkload(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!procedure || !confirmed || save.isPending) return;
    const fields = new FormData(event.currentTarget);
    const text = (field: string) => String(fields.get(field) ?? "").trim() || undefined;
    const count = Number(text("tamano_muestra"));
    const population = text("poblacion_estimada");
    const source = text("fuente_poblacion");
    const reason = text("motivo_desviacion");
    if (count > procedure.max_frutos || (procedure.tamano_recomendado && count !== procedure.tamano_recomendado && !reason)) {
      setError("Respeta el máximo del procedimiento y justifica cualquier diferencia con el tamaño recomendado.");
      return;
    }
    if ((procedure.requiere_poblacion && !population) || (population && (!source || count > Number(population)))) {
      setError("Documenta una población que cubra el tamaño de la muestra.");
      return;
    }
    const result = samplingInput.safeParse({
      procedure_id: procedure.id, tamano_muestra: count, confirmar_instrucciones: confirmed,
      confirmar_carga: workload || undefined, poblacion_estimada: population ? Number(population) : undefined,
      fuente_poblacion: source, motivo_desviacion: reason, observaciones: text("observaciones"),
    });
    setError(result.success ? "" : result.error.issues[0]?.message ?? "Revisa los datos.");
    if (result.success) save.mutate(result.data);
  }

  if (query.isPending) return <p role="status">Cargando procedimientos…</p>;
  if (query.isError) return <AdminError error={query.error} retry={() => { void query.refetch(); }} />;

  return (
    <div className="space-y-3">
      <Select isDisabled={save.isPending || !procedures.length} value={selected || null} placeholder="Selecciona un procedimiento"
        onChange={(value) => choose(typeof value === "string" ? value : "")}>
        <Label>Procedimiento autorizado</Label>
        <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
        <Select.Popover><ListBox aria-label="Procedimientos">
          {procedures.map((item) => (
            <ListBox.Item key={item.id} id={String(item.id)} textValue={item.nombre}>{item.nombre} · v{item.version}</ListBox.Item>
          ))}
        </ListBox></Select.Popover>
      </Select>
      {procedures.length ? null : <p>No hay procedimientos activos para este producto en esta página.</p>}
      <AdminPagination page={page} last={query.data.meta.last_page} onChange={(next) => { choose(""); setPage(next); }} />
      {procedure ? (
        <form key={procedure.id} className="space-y-4" onSubmit={submit}>
          <fieldset className="grid gap-3" disabled={save.isPending}>
            <p>{procedure.criterio_muestra}</p>
            <p>{procedure.seleccion_frutos}</p>
            <TextField isRequired name="tamano_muestra" type="number" defaultValue={String(procedure.tamano_recomendado ?? "")}>
              <Label>Tamaño de muestra (máximo {procedure.max_frutos})</Label>
              <Input min={1} max={procedure.max_frutos} />
            </TextField>
            <TextField isRequired={procedure.requiere_poblacion} name="poblacion_estimada" type="number">
              <Label>Población estimada</Label><Input min={1} max={100000000} />
            </TextField>
            <TextField isRequired={procedure.requiere_poblacion} name="fuente_poblacion">
              <Label>Fuente de la estimación</Label><Input maxLength={500} />
            </TextField>
            <TextField name="motivo_desviacion">
              <Label>Motivo si difiere del tamaño recomendado</Label><Input maxLength={1500} />
            </TextField>
            <TextField name="observaciones"><Label>Observaciones</Label><Input maxLength={3000} /></TextField>
            <Checkbox isSelected={confirmed} onChange={setConfirmed}>
              <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Content>Confirmo las instrucciones del procedimiento</Checkbox.Content>
            </Checkbox>
            <Checkbox isSelected={workload} onChange={setWorkload}>
              <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Content>Confirmo la carga de trabajo si la muestra supera el umbral del servicio</Checkbox.Content>
            </Checkbox>
          </fieldset>
          {error || save.error ? <p role="alert">{error || save.error?.message}</p> : null}
          <Button isDisabled={!confirmed || save.isPending} type="submit" variant="primary">Registrar muestreo</Button>
        </form>
      ) : null}
    </div>
  );
}
