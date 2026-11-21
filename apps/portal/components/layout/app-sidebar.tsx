"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ScrollShadow } from "@heroui/react";

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
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border/80 bg-surface shadow-[4px_0_24px_-16px_rgba(0,0,0,0.16)] transition-[width] duration-200 motion-reduce:transition-none lg:flex",
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
          <span className="min-w-0">
            <span className="block truncate text-lg tracking-tight">
              AgroCloud <span className="text-accent">AI</span>
            </span>
            <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.18em] text-muted">
              Calidad postcosecha
            </span>
          </span>
        ) : null}
      </Link>

      <ScrollShadow
        size={28}
        hideScrollBar
        className="min-h-0 flex-1 overscroll-contain px-3 py-5"
        aria-label="Módulos disponibles"
      >
        <NavigationList collapsed={collapsed} pathname={pathname} sections={sections} />
      </ScrollShadow>
      {!collapsed ? (
        <div className="shrink-0 border-t border-border px-5 py-3 text-xs text-muted">
          Tu espacio de trabajo agrícola
        </div>
      ) : null}
    </aside>
  );
}
