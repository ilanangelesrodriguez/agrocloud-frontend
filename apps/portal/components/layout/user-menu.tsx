"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown, Button, Label, Separator, Avatar, Tooltip, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { FiArrowUpRight, FiGlobe, FiLogOut, FiUser } from "react-icons/fi";

import type { IdentityUser } from "@/lib/auth/schemas";

import { postAuth } from "@/features/auth/request";

const websiteUrl = "/";

export function UserMenu({ user }: { user: IdentityUser }) {
  const router = useRouter();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fullName = [user.nombre, user.apellido].filter(Boolean).join(" ").trim();
  const initials = [user.nombre, user.apellido]
    .filter(Boolean)
    .map((part) => part!.trim()[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function signOut() {
    if (busy) return;

    setBusy(true);
    try {
      await postAuth("/api/auth/logout");
      cache.clear();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : "No se pudo cerrar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <Tooltip delay={400} isDisabled={isOpen}>
        <Button
          isIconOnly
          aria-label={`Abrir menú de ${fullName || user.correo}`}
          className="size-11 shrink-0 rounded-full border border-accent/20 bg-accent/5 p-1 transition-colors hover:border-accent/50 hover:bg-accent/10 aria-expanded:border-accent/50 aria-expanded:bg-accent/10"
          variant="tertiary"
        >
          <Avatar className="pointer-events-none size-8 bg-accent/15 text-accent">
            <Avatar.Fallback className="text-sm font-semibold">{initials || "AC"}</Avatar.Fallback>
          </Avatar>
        </Button>
        <Tooltip.Content placement="bottom end" className="text-xs">
          Mi cuenta
        </Tooltip.Content>
      </Tooltip>
      <Dropdown.Popover
        placement="bottom end"
        offset={10}
        className="w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-overlay p-1.5 shadow-xl"
      >
        <div className="flex items-center gap-3 rounded-xl bg-accent/5 px-3 py-4">
          <Avatar className="size-11 shrink-0 bg-accent/15 text-accent">
            <Avatar.Fallback className="font-semibold">{initials || "AC"}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-semibold leading-snug text-foreground">
              {fullName || "Mi cuenta"}
            </p>
            <p className="mt-1 break-all text-xs leading-relaxed text-muted">{user.correo}</p>
            {user.rol?.nombre ? (
              <span className="mt-2 inline-flex max-w-full rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                {user.rol.nombre}
              </span>
            ) : null}
          </div>
        </div>
        <Dropdown.Menu
          aria-label="Opciones de cuenta"
          className="gap-1 pt-1.5"
          onAction={(key) => {
            if (key === "profile") router.push("/settings/profile");
            if (key === "logout") void signOut();
          }}
        >
          <Dropdown.Item id="profile" className="gap-3 rounded-xl px-3 py-2.5" textValue="Mi perfil">
            <FiUser aria-hidden="true" className="size-4 shrink-0 text-muted" />
            <Label>Mi perfil</Label>
          </Dropdown.Item>
          {websiteUrl ? (
            <Dropdown.Item id="website" href={websiteUrl} className="gap-3 rounded-xl px-3 py-2.5" textValue="Volver al sitio web">
              <FiGlobe aria-hidden="true" className="size-4 shrink-0 text-muted" />
              <Label>Volver al sitio web</Label>
              <FiArrowUpRight aria-hidden="true" className="ml-auto size-3.5 shrink-0 text-muted" />
            </Dropdown.Item>
          ) : null}
          <Separator className="my-1" />
          <Dropdown.Item id="logout" variant="danger" className="gap-3 rounded-xl px-3 py-2.5" isDisabled={busy} textValue="Cerrar sesión">
            <FiLogOut aria-hidden="true" className="size-4 shrink-0" />
            <Label>{busy ? "Cerrando sesión…" : "Cerrar sesión"}</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
