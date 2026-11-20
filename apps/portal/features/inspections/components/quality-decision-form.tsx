"use client";
import type { z } from "zod";
import type { qualityDecision } from "@/features/agricultural/inspection";
import { useState } from "react";
import { Button, Checkbox, Input, Label, TextArea, TextField, toast } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { ErrorState, FormNotice, InlineNotice, LoadingState } from "@agrocloud/ui";
import { useMasterCatalog } from "@/features/company/agricultural/hooks";
import { CatalogSelect } from "@/features/company/agricultural/components/catalog-select";
import { issueDecision } from "../review-api";
import { decisionInput } from "../review-schema";

export function QualityDecisionForm({
  inspectionId,
  previous,
  onSaved,
}: {
  inspectionId: string;
  previous?: z.infer<typeof qualityDecision>;
  onSaved: () => Promise<unknown>;
}) {
  const [decision, setDecision] = useState("APROBADO");
  const [type, setType] = useState("REINSPECCION");
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [independent, setIndependent] = useState(false);
  const [error, setError] = useState("");
  const categories = useMasterCatalog("categoria", true);
  const reasons = useMasterCatalog("motivo", true);
  const save = useMutation({
    mutationFn: (input: z.infer<typeof decisionInput>) => issueDecision(inspectionId, input),
    retry: false,
    onSuccess: async () => {
      await onSaved();
      toast.success("Dictamen de calidad registrado");
    },
  });
  if (categories.isPending || reasons.isPending)
    return <LoadingState label="Cargando categorías y motivos" />;
  const failed = categories.error ?? reasons.error;
  if (failed)
    return (
      <ErrorState
        error={failed}
        retry={() => Promise.all([categories.refetch(), reasons.refetch()])}
      />
    );
  return (
    <form
      className="space-y-5 border-t border-border pt-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (save.isPending) return;
        const fields = new FormData(event.currentTarget);
        const parsed = decisionInput.safeParse({
          decision,
          tipo_observacion: decision === "OBSERVADO" ? type : null,
          categoria: category || null,
          motivo: decision === "APROBADO" ? null : reason || null,
          dictamen_anterior: previous?.id_dictamen,
          respuesta_observacion: String(fields.get("respuesta_observacion") ?? "").trim() || null,
          protocolo_calidad: fields.get("protocolo_calidad"),
          observaciones: fields.get("observaciones"),
          revision_independiente: independent,
        });
        setError(parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa el dictamen."));
        if (parsed.success) save.mutate(parsed.data);
      }}
    >
      <InlineNotice
        status="accent"
        title={previous ? "Respuesta a una observación" : "Revisión independiente de calidad"}
        description="La aprobación libera el lote como clasificado. Una observación puede requerir corrección documental o una nueva inspección. El servicio verificará las revisiones e incidencias que puedan impedir la liberación."
      />
      <fieldset disabled={save.isPending} className="grid gap-5 sm:grid-cols-2">
        <CatalogSelect
          label="Decisión"
          value={decision}
          onChange={setDecision}
          disabled={save.isPending}
          items={[
            { id: "APROBADO", name: "Aprobado" },
            { id: "OBSERVADO", name: "Observado" },
            { id: "RECHAZADO", name: "Rechazado" },
          ]}
        />
        <CatalogSelect
          label="Categoría comercial (opcional)"
          value={category}
          onChange={setCategory}
          optional
          emptyLabel="Sin categoría"
          disabled={save.isPending}
          items={(categories.data?.data ?? []).map((item) => ({
            id: item.nombre,
            name: item.nombre,
          }))}
        />
        {decision === "OBSERVADO" ? (
          <CatalogSelect
            label="Tipo de observación"
            value={type}
            onChange={setType}
            disabled={save.isPending}
            items={[
              { id: "REINSPECCION", name: "Reinspección" },
              { id: "DOCUMENTACION", name: "Documentación" },
              { id: "CORRECCION_ADMINISTRATIVA", name: "Corrección administrativa" },
            ]}
          />
        ) : null}
        {decision !== "APROBADO" ? (
          <CatalogSelect
            label="Motivo (opcional)"
            value={reason}
            onChange={setReason}
            optional
            emptyLabel="Sin motivo de catálogo"
            disabled={save.isPending}
            items={(reasons.data?.data ?? []).map((item) => ({
              id: item.nombre,
              name: item.nombre,
            }))}
          />
        ) : null}
        <TextField isRequired name="protocolo_calidad" className="sm:col-span-2">
          <Label>Protocolo de calidad aplicado</Label>
          <Input maxLength={200} />
        </TextField>
        <TextField isRequired name="observaciones" className="sm:col-span-2">
          <Label>Fundamento del dictamen</Label>
          <TextArea rows={4} maxLength={3000} />
        </TextField>
        {previous ? (
          <TextField isRequired name="respuesta_observacion" className="sm:col-span-2">
            <Label>Respuesta a la observación anterior</Label>
            <TextArea rows={3} maxLength={3000} />
          </TextField>
        ) : null}
        <Checkbox
          className="sm:col-span-2"
          isDisabled={save.isPending}
          isSelected={independent}
          onChange={setIndependent}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Label>Confirmo mi revisión independiente de la inspección y sus evidencias.</Label>
          </Checkbox.Content>
        </Checkbox>
      </fieldset>
      {error || save.error ? <FormNotice message={error || save.error?.message} /> : null}
      <Button
        type="submit"
        variant={decision === "RECHAZADO" ? "danger" : "primary"}
        isDisabled={!independent || save.isPending}
      >
        {save.isPending ? "Emitiendo…" : "Emitir dictamen"}
      </Button>
    </form>
  );
}
