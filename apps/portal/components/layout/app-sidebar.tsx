"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

import type { NavigationSection } from "@/config/navigation";

import { NavigationList } from "./navigation-list";

export function AppSidebar({
  sections,
  pathname,
  home,
  collapsed,
}: {
  sections: NavigationSection[];
  pathname: string;
  home: string;
  collapsed: boolean;
}) {
  return (
    <aside
      aria-label="Barra lateral"
      className={clsx(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
      )}
    >
      <Link
        aria-label="AgroCloud - inicio"
        className={clsx(
          "flex h-18 shrink-0 items-center gap-3 border-b border-border px-5 font-semibold",
          collapsed && "justify-center px-2",
        )}
        href={home}
      >
        <Image alt="" height={34} src="/agrocloud/logo-mark.svg" width={34} />
        {!collapsed ? (
          <span className="truncate text-lg">
            AgroCloud <span className="text-accent">AI</span>
          </span>
        ) : null}
      </Link>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <NavigationList collapsed={collapsed} pathname={pathname} sections={sections} />
      </div>
      {!collapsed ? (
        <div className="shrink-0 border-t border-border px-5 py-3 text-xs text-muted">
          Gestión de calidad postcosecha
        </div>
      ) : null}
    </aside>
  );
}
