"use client";

import type { FormEvent } from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany } from "@/features/company/navigation";
import {
  Button,
  Checkbox,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmptyState, ErrorState, FormNotice, LoadingState } from "@agrocloud/ui";

import { samplingInput } from "../schema";
import { registerSampling } from "../api";
import { useAllSamplingProcedures } from "../hooks";

export function SamplingForm({ lotId, product }: { lotId: number; product: string }) {
  const cache = useQueryClient();
  const router = useRouter();
  const { data: actor } = useCurrentUser();
  const [selected, setSelected] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [workload, setWorkload] = useState(false);
  const [error, setError] = useState("");
  const query = useAllSamplingProcedures(canManageCompany(actor, "muestreos.crear"), {
    producto: product,
    activo: true,
  });
  const procedures = query.data?.data ?? [];
  const procedure = procedures.find((item) => String(item.id) === selected);
  const save = useMutation({
    mutationFn: (input: object) => registerSampling(lotId, input),
    onSuccess: async ({ data }) => {
      toast.success("Muestreo registrado");
      await cache.invalidateQueries({ queryKey: ["agricultural", "lots"] });
      if (canManageCompany(actor, "muestreos.ver")) {
        router.push("/samplings/" + data.id_muestreo);
      }
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

    if (
      count > procedure.max_frutos ||
      (procedure.tamano_recomendado && count !== procedure.tamano_recomendado && !reason)
    ) {
      setError(
        "Respeta el máximo del procedimiento y justifica cualquier diferencia con el tamaño recomendado.",
      );

      return;
    }
    if (
      (procedure.requiere_poblacion && !population) ||
      (population && (!source || count > Number(population)))
    ) {
      setError("Documenta una población que cubra el tamaño de la muestra.");

      return;
    }
    const result = samplingInput.safeParse({
      procedure_id: procedure.id,
      tamano_muestra: count,
      confirmar_instrucciones: confirmed,
      confirmar_carga: workload || undefined,
      poblacion_estimada: population ? Number(population) : undefined,
      fuente_poblacion: source,
      motivo_desviacion: reason,
      observaciones: text("observaciones"),
    });

    setError(result.success ? "" : (result.error.issues[0]?.message ?? "Revisa los datos."));
    if (result.success) save.mutate(result.data);
  }

  if (query.isPending) return <LoadingState label="Cargando procedimientos" />;
  if (query.isError)
    return (
      <ErrorState
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
    );

  return (
    <div className="space-y-6 pt-3">
      <Select
        isDisabled={save.isPending || !procedures.length}
        placeholder="Selecciona un procedimiento"
        value={selected || null}
        onChange={(value) => choose(typeof value === "string" ? value : "")}
      >
        <Label>Procedimiento autorizado</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox aria-label="Procedimientos">
            {procedures.map((item) => (
              <ListBox.Item key={item.id} id={String(item.id)} textValue={item.nombre}>
                {item.nombre} · v{item.version}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      {procedures.length ? null : (
        <EmptyState
          title="No hay procedimientos activos"
          description="No hay un procedimiento activo para este producto. Solicita al administrador de tu empresa que lo registre en Configuración / Procedimientos."
        />
      )}
      {procedure ? (
        <form key={procedure.id} className="space-y-6" onSubmit={submit}>
          <fieldset className="grid gap-5 sm:grid-cols-2" disabled={save.isPending}>
            <div className="space-y-4 rounded-2xl border border-accent/20 bg-accent/5 p-5 sm:col-span-2">
              <div>
                <h3 className="font-semibold">Instrucciones del procedimiento</h3>
                <p className="mt-1 text-sm text-muted">
                  {procedure.nombre} · v{procedure.version} · {procedure.metodo}
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold">Criterio de muestra</h4>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {procedure.criterio_muestra}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Selección de frutos</h4>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {procedure.seleccion_frutos}
                  </p>
                </div>
              </div>
              {procedure.tamano_recomendado ? (
                <p className="text-sm text-muted">
                  Tamaño recomendado: {procedure.tamano_recomendado} frutos. Justifica cualquier
                  diferencia antes de registrar la muestra.
                </p>
              ) : null}
            </div>
            <TextField
              isRequired
              defaultValue={String(procedure.tamano_recomendado ?? "")}
              name="tamano_muestra"
              type="number"
            >
              <Label>Tamaño de muestra (máximo {procedure.max_frutos})</Label>
              <Input max={procedure.max_frutos} min={1} />
            </TextField>
            <TextField
              isRequired={procedure.requiere_poblacion}
              name="poblacion_estimada"
              type="number"
            >
              <Label>Población estimada</Label>
              <Input max={100000000} min={1} />
            </TextField>
            <TextField isRequired={procedure.requiere_poblacion} name="fuente_poblacion">
              <Label>Fuente de la estimación</Label>
              <Input maxLength={500} />
            </TextField>
            <TextField className="sm:col-span-2" name="motivo_desviacion">
              <Label>Motivo si difiere del tamaño recomendado</Label>
              <TextArea rows={2} maxLength={1500} />
            </TextField>
            <TextField className="sm:col-span-2" name="observaciones">
              <Label>Observaciones</Label>
              <TextArea rows={3} maxLength={3000} />
            </TextField>
            <Checkbox
              className="sm:col-span-2"
              isDisabled={save.isPending}
              isSelected={confirmed}
              onChange={setConfirmed}
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Label>Confirmo las instrucciones del procedimiento</Label>
              </Checkbox.Content>
            </Checkbox>
            <Checkbox
              className="sm:col-span-2"
              isDisabled={save.isPending}
              isSelected={workload}
              onChange={setWorkload}
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Label>
                  Confirmo la carga de trabajo si la muestra supera el umbral del servicio
                </Label>
              </Checkbox.Content>
            </Checkbox>
          </fieldset>
          {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
          <Button isDisabled={!confirmed || save.isPending} type="submit" variant="primary">
            Registrar muestreo
          </Button>
        </form>
      ) : null}
    </div>
  );
}
