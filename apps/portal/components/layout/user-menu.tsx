"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown, Button, Label, Separator, Avatar, toast } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { FiChevronDown } from "react-icons/fi";

import type { IdentityUser } from "@/lib/auth/schemas";

import { postAuth } from "@/features/auth/request";

export function UserMenu({ user }: { user: IdentityUser }) {
  const router = useRouter();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
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
    <Dropdown>
      <Dropdown.Trigger>
        <Button
          aria-label="Abrir menú de usuario"
          className="max-w-52 gap-2 px-2"
          size="sm"
          variant="tertiary"
        >
          <Avatar className="size-8 shrink-0">
            <Avatar.Fallback>{initials || "AC"}</Avatar.Fallback>
          </Avatar>
          <span className="hidden min-w-0 truncate text-sm font-medium sm:block">
            {user.nombre}
          </span>
          <FiChevronDown aria-hidden="true" className="hidden size-4 shrink-0 sm:block" />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          aria-label="Opciones de cuenta"
          onAction={(key) => {
            if (key === "profile") router.push("/settings/profile");
            if (key === "logout") void signOut();
          }}
        >
          <Dropdown.Item id="account" isDisabled textValue={user.correo}>
            <Label>{user.correo}</Label>
          </Dropdown.Item>
          <Separator />
          <Dropdown.Item id="profile" textValue="Mi perfil">
            <Label>Mi perfil</Label>
          </Dropdown.Item>
          <Dropdown.Item id="logout" isDisabled={busy} textValue="Cerrar sesión">
            <Label>{busy ? "Cerrando sesión…" : "Cerrar sesión"}</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
