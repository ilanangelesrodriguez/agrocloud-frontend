"use client";
import { fieldErrorsFrom } from "@/lib/form-fields";
import type { z } from "zod";
import type { qualityDecision } from "@/features/agricultural/inspection";
import { useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Label,
  TextArea,
  TextField,
  toast,
  FieldError,
  Form,
} from "@heroui/react";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
    <Form
      validationErrors={fieldErrors}
      validationBehavior="native"
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
        setFieldErrors(parsed.success ? {} : fieldErrorsFrom(parsed.error.issues));
        if (parsed.success) save.mutate(parsed.data);
      }}
    >
      <InlineNotice
        status="accent"
        title={previous ? "Respuesta a una observación" : "Revisión independiente de calidad"}
        description="La aprobación libera el lote como clasificado. Una observación puede requerir corrección documental o una nueva inspección. El servicio verificará las revisiones e incidencias que puedan impedir la liberación."
      />
      <fieldset
        onInputCapture={() => setFieldErrors({})}
        disabled={save.isPending}
        className="grid gap-5 sm:grid-cols-2"
      >
        <CatalogSelect
          name="decision"
          label="Decisión"
          value={decision}
          onChange={(value) => {
            setFieldErrors({});
            setDecision(value);
          }}
          disabled={save.isPending}
          items={[
            { id: "APROBADO", name: "Aprobado" },
            { id: "OBSERVADO", name: "Observado" },
            { id: "RECHAZADO", name: "Rechazado" },
          ]}
        />
        <CatalogSelect
          name="categoria"
          label="Categoría comercial (opcional)"
          value={category}
          onChange={(value) => {
            setFieldErrors({});
            setCategory(value);
          }}
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
            name="tipo_observacion"
            label="Tipo de observación"
            value={type}
            onChange={(value) => {
              setFieldErrors({});
              setType(value);
            }}
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
            name="motivo"
            label="Motivo (opcional)"
            value={reason}
            onChange={(value) => {
              setFieldErrors({});
              setReason(value);
            }}
            optional
            emptyLabel="Sin motivo de catálogo"
            disabled={save.isPending}
            items={(reasons.data?.data ?? []).map((item) => ({
              id: item.nombre,
              name: item.nombre,
            }))}
          />
        ) : null}
        <TextField
          variant="secondary"
          isRequired
          name="protocolo_calidad"
          className="sm:col-span-2"
        >
          <Label>Protocolo de calidad aplicado</Label>
          <Input
            placeholder="Ingresa protocolo de calidad aplicado"
            variant="secondary"
            maxLength={200}
          />
          <FieldError />
        </TextField>
        <TextField variant="secondary" isRequired name="observaciones" className="sm:col-span-2">
          <Label>Fundamento del dictamen</Label>
          <TextArea
            placeholder="Añade los detalles relevantes"
            variant="secondary"
            rows={4}
            maxLength={3000}
          />
          <FieldError />
        </TextField>
        {previous ? (
          <TextField
            variant="secondary"
            isRequired
            name="respuesta_observacion"
            className="sm:col-span-2"
          >
            <Label>Respuesta a la observación anterior</Label>
            <TextArea
              placeholder="Ingresa respuesta a la observación anterior"
              variant="secondary"
              rows={3}
              maxLength={3000}
            />
            <FieldError />
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
    </Form>
  );
}
