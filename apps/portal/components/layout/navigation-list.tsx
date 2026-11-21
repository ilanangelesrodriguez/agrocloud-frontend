"use client";

import { useId, useState } from "react";
import { Input } from "@heroui/react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { isActiveRoute, type NavigationSection } from "@/config/navigation";
import { SidebarItem } from "./sidebar-item";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

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
  const [search, setSearch] = useState("");
  const term = collapsed ? "" : normalize(search.trim());
  const visible = sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !term || normalize(item.label + " " + section.title).includes(term),
      ),
    }))
    .filter((section) => section.items.length > 0);
  return (
    <nav aria-label="Navegación principal" className="space-y-4">
      {!collapsed && sections.reduce((total, section) => total + section.items.length, 0) > 8 ? (
        <div className="relative mb-5">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 z-10 size-4 text-muted"
          />
          <Input
            aria-label="Buscar módulo en el menú"
            variant="secondary"
            placeholder="Buscar módulo…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 text-sm"
          />
        </div>
      ) : null}
      {visible.map((section) => (
        <MenuSection
          key={
            section.title +
            (section.items.some((item) => isActiveRoute(pathname, item.href)) ? "-active" : "")
          }
          section={section}
          pathname={pathname}
          collapsed={collapsed}
          searching={!!term}
          onNavigate={onNavigate}
        />
      ))}
      {!visible.length ? (
        <p role="status" className="px-3 py-6 text-center text-sm text-muted">
          No se encontraron módulos.
        </p>
      ) : null}
    </nav>
  );
}

function MenuSection({
  section,
  pathname,
  collapsed,
  searching,
  onNavigate,
}: {
  section: NavigationSection;
  pathname: string;
  collapsed: boolean;
  searching: boolean;
  onNavigate?: () => void;
}) {
  const id = useId();
  const active = section.items.some((item) => isActiveRoute(pathname, item.href));
  const [expanded, setExpanded] = useState(
    active || ["General", "Plataforma"].includes(section.title),
  );
  const open = collapsed || searching || expanded;
  return (
    <section aria-label={section.title} className="space-y-1">
      {collapsed ? (
        <div className="mx-3 mb-2 border-t border-border/70">
          <span className="sr-only">{section.title}</span>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setExpanded(!open)}
          disabled={searching}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span>{section.title}</span>
          <FiChevronDown
            aria-hidden="true"
            className={"size-3.5 transition-transform " + (open ? "" : "-rotate-90")}
          />
        </button>
      )}
      <ul id={id} hidden={!open} className="space-y-1">
        {section.items.map((item) => (
          <li key={item.href}>
            <SidebarItem
              collapsed={collapsed}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
