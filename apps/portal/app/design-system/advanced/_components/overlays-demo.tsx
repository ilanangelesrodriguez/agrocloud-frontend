"use client";

import { QuotaMeter } from "@agrocloud/ui";
import {
  AlertDialog,
  Avatar,
  AvatarGroup,
  Button,
  Input,
  Label,
  Modal,
  Sheet,
  Separator,
  TextField,
  toast,
} from "@heroui/react";
import { DemoLabel, DemoSection } from "./demo-section";

function DemoAvatar({ initials }: { initials: string }) {
  return (
    <Avatar>
      <Avatar.Fallback>{initials}</Avatar.Fallback>
    </Avatar>
  );
}

export function OverlaysDemo() {
  return (
    <DemoSection
      title="Ventanas, paneles e identidad"
      description="Sheet · Modal · AlertDialog · Meter · Avatar · AvatarGroup"
    >
      <div className="grid gap-3">
        <DemoLabel>Sheet (panel temporal, incluso en móvil)</DemoLabel>
        <Sheet placement="bottom">
          <Sheet.Trigger>
            <Button variant="secondary">Abrir ficha rápida</Button>
          </Sheet.Trigger>
          <Sheet.Backdrop>
            <Sheet.Content className="mx-auto max-w-xl">
              <Sheet.Dialog className="border border-border bg-surface">
                <Sheet.Handle />
                <Sheet.CloseTrigger aria-label="Cerrar ficha" />
                <Sheet.Header>
                  <Sheet.Heading>Vista rápida del lote</Sheet.Heading>
                </Sheet.Header>
                <Sheet.Body className="grid gap-3 p-5">
                  <p className="font-mono text-sm">LOTE-2026-042</p>
                  <p className="text-sm text-muted">Información de demostración: peso registrado 840 kg y revisión pendiente.</p>
                  <QuotaMeter label="Cupo mensual de lotes" used={41} limit={50} />
                </Sheet.Body>
                <Sheet.Footer>
                  <Sheet.Close><Button variant="primary">Entendido</Button></Sheet.Close>
                </Sheet.Footer>
              </Sheet.Dialog>
            </Sheet.Content>
          </Sheet.Backdrop>
        </Sheet>
      </div>

      <Separator />

      <div className="grid gap-3">
        <DemoLabel>Modal (formulario de edición)</DemoLabel>
        <Modal>
          <Button variant="secondary">Abrir formulario</Button>
          <Modal.Backdrop isDismissable>
            <Modal.Container>
              <Modal.Dialog className="rounded-dialog">
                <Modal.CloseTrigger aria-label="Cerrar formulario" />
                <Modal.Header><Modal.Heading>Editar información del lote</Modal.Heading></Modal.Header>
                <Modal.Body>
                  <TextField>
                    <Label>Código</Label>
                    <Input placeholder="LOTE-2026-042" />
                  </TextField>
                  <p className="mt-2 text-xs text-muted">Sin conexión a API: este es un formulario ilustrativo.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="secondary">Cerrar</Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      <Separator />

      <div className="grid gap-3">
        <DemoLabel>AlertDialog (confirmación crítica)</DemoLabel>
        <AlertDialog>
          <Button variant="danger-soft">Cancelar lote de ejemplo</Button>
          <AlertDialog.Backdrop>
            <AlertDialog.Container placement="center" size="sm">
              <AlertDialog.Dialog className="rounded-dialog">
                {({ close }) => (
                  <>
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger" />
                      <AlertDialog.Heading>¿Confirmar cancelación?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>Esta demostración no modifica ningún registro real.</AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button variant="secondary" slot="close">Volver</Button>
                      <Button variant="danger" onPress={() => {
                        close();
                        toast.warning("Cancelación simulada", { description: "No se enviaron solicitudes al servidor." });
                      }}>Confirmar demo</Button>
                    </AlertDialog.Footer>
                  </>
                )}
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <DemoLabel>Meter (cupos, no carga asíncrona)</DemoLabel>
          <QuotaMeter label="Lotes utilizados" used={42} limit={50} />
          <QuotaMeter label="Usuarios registrados" used={3} limit={10} />
        </div>
        <div className="grid content-start gap-3">
          <DemoLabel>Avatar y AvatarGroup</DemoLabel>
          <AvatarGroup max={3} role="group" aria-label="Equipo de inspección ficticio">
            <DemoAvatar initials="RM" />
            <DemoAvatar initials="AL" />
            <DemoAvatar initials="JV" />
            <DemoAvatar initials="MP" />
          </AvatarGroup>
          <p className="text-xs text-muted">Usa iniciales cuando un usuario todavía no tenga fotografía.</p>
        </div>
      </div>
    </DemoSection>
  );
}
