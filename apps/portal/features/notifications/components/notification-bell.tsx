"use client";
import { useState } from "react";
import Link from "next/link";
import { Button, Popover } from "@heroui/react";
import { FiBell } from "react-icons/fi";
import { useUnreadNotifications } from "../hooks";
import { NotificationList } from "./notification-list";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const count = useUnreadNotifications(true);
  const unread = count.data?.unreadCount ?? 0;
  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Button
        isIconOnly
        variant="tertiary"
        className="relative size-10 overflow-visible"
        aria-label={
          count.isError
            ? "Notificaciones: contador no disponible"
            : `Notificaciones, ${unread} sin leer`
        }
      >
        <FiBell aria-hidden="true" className="size-5" />
        {unread > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        ) : count.isError ? (
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 size-2 rounded-full bg-warning"
          />
        ) : null}
      </Button>
      <Popover.Content
        placement="bottom end"
        className="w-[26rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-overlay p-0 shadow-xl"
      >
        <Popover.Dialog className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <Popover.Heading className="text-lg font-semibold">Notificaciones</Popover.Heading>
            <Link
              href="/notifications#preferences"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-accent"
            >
              Preferencias
            </Link>
          </div>
          {open ? <NotificationList compact onNavigate={() => setOpen(false)} /> : null}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border pt-4 text-center text-sm font-medium text-accent"
          >
            Ver todas las notificaciones
          </Link>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
