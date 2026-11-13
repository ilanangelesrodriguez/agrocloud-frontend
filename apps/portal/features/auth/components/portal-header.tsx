"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";

import { postAuth } from "../request";
import { useCurrentUser } from "../hooks/use-current-user";

import { ThemeSwitch } from "@/components/theme-switch";

export function PortalHeader() {
  const router = useRouter();
  const cache = useQueryClient();
  const { data: user } = useCurrentUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await postAuth("/api/auth/logout");
      cache.clear();
      router.replace("/login");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cerrar sesión.");
    } finally {
      setBusy(false);
    }
  };
  const home = user?.rol?.codigo === "SUPERADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link className="flex items-center gap-2.5 font-semibold" href={home}>
          <Image alt="" height={34} src="/agrocloud/logo-mark.svg" width={34} />
          AgroCloud <span className="text-accent">AI</span>
        </Link>
        <nav aria-label="Cuenta" className="flex flex-wrap items-center gap-2 text-sm">
          <Link className="rounded-lg px-3 py-2 text-muted hover:text-foreground" href={home}>
            Inicio
          </Link>
          <Link
            className="rounded-lg px-3 py-2 text-muted hover:text-foreground"
            href="/settings/profile"
          >
            Mi cuenta
          </Link>
          <ThemeSwitch />
          <Button
            isDisabled={busy}
            size="sm"
            variant="secondary"
            onPress={() => {
              void signOut();
            }}
          >
            {busy ? "Saliendo…" : "Cerrar sesión"}
          </Button>
        </nav>
      </div>
      {error && (
        <p className="mx-auto max-w-6xl px-5 pb-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </header>
  );
}
