"use client";

import { PageHeader, StatusBadge, type StatusTone } from "@agrocloud/ui";
import { Button, Input, Label, Modal, Table, TextField } from "@heroui/react";

const lots: { id: string; weight: string; status: string; tone: StatusTone }[] = [
  { id: "LOTE-001", weight: "1 250,50 kg", status: "Aprobado", tone: "success" },
  { id: "LOTE-002", weight: "480,00 kg", status: "Pendiente", tone: "warning" },
  { id: "LOTE-003", weight: "320,00 kg", status: "Rechazado", tone: "danger" },
  { id: "LOTE-004", weight: "760,25 kg", status: "Análisis en curso", tone: "info" },
  { id: "LOTE-005", weight: "125,00 kg", status: "Cancelado", tone: "neutral" },
];

export default function DesignSystemPage() {
  return (
    <section className="mx-auto grid max-w-4xl gap-6 pb-8" lang="es">
      <PageHeader
        title="Control de calidad"
        description="Muestra del sistema de diseño con datos de ejemplo."
        actions={
          <Modal>
            <Button className="h-10 rounded-control" variant="primary">
              Nuevo lote
            </Button>
            <Modal.Backdrop isDismissable>
              <Modal.Container>
                <Modal.Dialog className="rounded-dialog">
                  <Modal.CloseTrigger aria-label="Cerrar" />
                  <Modal.Header>
                    <Modal.Heading>Nuevo lote</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <TextField>
                      <Label>Código del lote</Label>
                      <Input className="min-h-10" placeholder="LOTE-006" />
                    </TextField>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button slot="close" variant="secondary">
                      Cerrar
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        }
      />

      <section className="grid min-w-0 gap-4 rounded-card border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Lotes de ejemplo</h2>
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Lotes de ejemplo">
              <Table.Header>
                <Table.Column isRowHeader>Lote</Table.Column>
                <Table.Column>Peso</Table.Column>
                <Table.Column>Estado</Table.Column>
              </Table.Header>
              <Table.Body items={lots}>
                {(lot) => (
                  <Table.Row className="h-12" id={lot.id}>
                    <Table.Cell className="whitespace-nowrap font-mono">{lot.id}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap tabular-nums">{lot.weight}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge tone={lot.tone}>{lot.status}</StatusBadge>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </section>
    </section>
  );
}
