"use client";

import { Button } from "@heroui/react";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

import type { NavigationSection } from "@/config/navigation";
import type { IdentityUser } from "@/lib/auth/schemas";

import { ThemeSwitch } from "@/components/theme-switch";

import { AppBreadcrumbs } from "./breadcrumbs";
import { MobileNavigation } from "./mobile-navigation";
import { UserMenu } from "./user-menu";

export function AppTopbar({
  sections,
  pathname,
  user,
  collapsed,
  onToggleSidebar,
}: {
  sections: NavigationSection[];
  pathname: string;
  user: IdentityUser;
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-18 shrink-0 items-center gap-3 border-b border-border bg-surface/95 px-4 shadow-sm backdrop-blur-xl sm:px-6">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-2"
        href="#main-content"
      >
        Saltar al contenido
      </a>
      <MobileNavigation pathname={pathname} sections={sections} />
      <Button
        aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        aria-pressed={collapsed}
        className="hidden lg:inline-flex"
        isIconOnly
        size="sm"
        variant="tertiary"
        onPress={onToggleSidebar}
      >
        {collapsed ? (
          <FiChevronsRight aria-hidden="true" className="size-5" />
        ) : (
          <FiChevronsLeft aria-hidden="true" className="size-5" />
        )}
      </Button>
      <div className="min-w-0 flex-1 overflow-hidden">
        <AppBreadcrumbs admin={user.rol?.codigo === "SUPERADMIN"} pathname={pathname} />
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <ThemeSwitch />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
