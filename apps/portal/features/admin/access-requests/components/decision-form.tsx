"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { FormNotice } from "@agrocloud/ui";
import { decisionSchema, requestPageSchema } from "../schema";
import { submitAccessRequestDecision } from "../api";

export function DecisionForm({
  id,
  onBusyChange,
}: {
  id: number;
  onBusyChange?: (busy: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState("EN_REVISION");
  const [manual, setManual] = useState(false);
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: (body: object) => submitAccessRequestDecision(id, body),
    onMutate: () => onBusyChange?.(true),
    onSettled: () => onBusyChange?.(false),
    onSuccess: async ({ data }) => {
      toast.success("Decisión registrada");
      queryClient.setQueriesData<ReturnType<typeof requestPageSchema.parse>>(
        { queryKey: ["admin", "access-requests"] },
        (page) => page && { ...page, data: page.data.map((row) => (row.id === id ? data : row)) },
      );
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    retry: false,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) return;
    const fields = new FormData(event.currentTarget);
    const parsed = decisionSchema.safeParse({
      decision,
      motivo: fields.get("motivo"),
      revision_manual: decision === "APROBADA" && manual,
      referencia_verificacion: fields.get("referencia") || undefined,
    });

    setError(
      parsed.success ? "" : (parsed.error.issues[0]?.message ?? "Revisa los datos ingresados."),
    );
    if (parsed.success) mutation.mutate(parsed.data);
  }

  return (
    <form className="mt-4 space-y-4 border-t border-border pt-4" onSubmit={submit}>
      <fieldset className="grid gap-3" disabled={mutation.isPending}>
        <legend className="mb-2 font-semibold">Registrar decisión</legend>
        <Select
          isDisabled={mutation.isPending}
          value={decision}
          onChange={(value) => {
            if (typeof value === "string") setDecision(value);
          }}
        >
          <Label>Decisión</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label="Decisiones">
              <ListBox.Item id="EN_REVISION" textValue="En revisión">
                En revisión
              </ListBox.Item>
              <ListBox.Item id="APROBADA" textValue="Aprobar">
                Aprobar
              </ListBox.Item>
              <ListBox.Item id="RECHAZADA" textValue="Rechazar">
                Rechazar
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
        {decision === "APROBADA" ? (
          <>
            <p className="text-sm text-muted">
              Identity verifica el RUC al aprobar. Si no confirma que esté activo y habido, debes
              justificar la revisión manual.
            </p>
            <Checkbox isDisabled={mutation.isPending} isSelected={manual} onChange={setManual}>
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Label>Confirmo que realicé una revisión manual</Label>
              </Checkbox.Content>
            </Checkbox>
            {manual ? (
              <TextField isDisabled={mutation.isPending} name="referencia">
                <Label>Referencia de verificación (opcional)</Label>
                <Input maxLength={255} />
              </TextField>
            ) : null}
          </>
        ) : null}
        <TextField isRequired isDisabled={mutation.isPending} name="motivo">
          <Label>Motivo</Label>
          <TextArea
            maxLength={2000}
            minLength={decision === "APROBADA" && manual ? 20 : 1}
            rows={3}
          />
        </TextField>
      </fieldset>
      {error || mutation.error ? <FormNotice message={error || mutation.error?.message} /> : null}
      <Button isDisabled={mutation.isPending} type="submit" variant="primary">
        {mutation.isPending ? "Guardando…" : "Guardar decisión"}
      </Button>
    </form>
  );
}
