"use client";

import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { Button, Drawer } from "@heroui/react";

export function CreationDrawer({
  open,
  onOpenChange,
  busy = false,
  title,
  description,
  trigger,
  children,
  closeLabel = "Cancelar",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  busy?: boolean;
  title: string;
  description: string;
  trigger: ReactNode;
  children: ReactNode;
  closeLabel?: string;
}) {
  return (
    <Drawer
      isOpen={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
    >
      {trigger}
      <Drawer.Backdrop isDismissable={!busy} isKeyboardDismissDisabled={busy}>
        <Drawer.Content placement="right">
          <Drawer.Dialog
            className="creation-drawer"
            style={{ width: "min(100vw, 42rem)", maxWidth: "100vw", padding: 0 }}
          >
            <Drawer.CloseTrigger aria-label="Cerrar panel" isDisabled={busy} />
            <Drawer.Header className="border-b border-border px-6 py-6 pr-14 sm:px-8">
              <Drawer.Heading className="text-xl font-semibold tracking-tight">
                {title}
              </Drawer.Heading>
              <p className="text-sm leading-relaxed text-muted">{description}</p>
            </Drawer.Header>
            <Drawer.Body className="m-0 px-6 py-6 text-foreground sm:px-8">
              {open ? children : null}
            </Drawer.Body>
            <Drawer.Footer className="border-t border-border px-6 py-4 sm:px-8">
              <Button isDisabled={busy} variant="secondary" onPress={() => onOpenChange(false)}>
                <FiX aria-hidden="true" /> {closeLabel}
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
