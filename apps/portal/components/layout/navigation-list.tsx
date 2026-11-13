"use client";

import type { NavigationSection } from "@/config/navigation";

import { SidebarItem } from "./sidebar-item";

export function NavigationList({
  sections,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  sections: NavigationSection[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Navegación principal" className="grid gap-5">
      {sections.map(({ title, items }) => (
        <div className="grid gap-1" key={title}>
          {!collapsed ? (
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              {title}
            </p>
          ) : (
            <span className="sr-only">{title}</span>
          )}
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              collapsed={collapsed}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}
