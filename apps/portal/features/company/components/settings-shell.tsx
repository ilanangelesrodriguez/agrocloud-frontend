"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { canManageCompany, settingsLinks } from "../navigation";

export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const active = settingsLinks.find(({ href }) => pathname === href || pathname.startsWith(href + "/"));

  return (
    <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)]">
      <nav aria-label="Configuración" className="flex flex-wrap content-start gap-2 md:flex-col">
        {[{ href: "/settings/profile", label: "Mi cuenta" },
          ...settingsLinks.filter(({ permission }) => canManageCompany(user, permission))].map(({ href, label }) => (
          <Link key={href} aria-current={(active?.href ?? pathname) === href ? "page" : undefined}
            className="rounded-lg px-3 py-2 text-sm aria-[current=page]:bg-accent-soft aria-[current=page]:font-semibold"
            href={href}>{label}</Link>
        ))}
      </nav>
      <div className="min-w-0">
        {active && !canManageCompany(user, active.permission)
          ? <p role="alert">No tienes permiso para acceder a esta sección.</p>
          : children}
      </div>
    </div>
  );
}
