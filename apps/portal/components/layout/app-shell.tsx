"use client";

import type { ReactNode } from "react";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SessionLoading } from "@/features/auth/components/session-loading";

import { navigationFor } from "@/config/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { homeForUser } from "@/lib/auth/schemas";

import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

const preferenceKey = "agrocloud.sidebar.collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(preferenceKey) === "true");
    } catch {
      // La navegación debe funcionar cuando el almacenamiento esté bloqueado.
    }
  }, []);

  if (!user) return <SessionLoading />;

  const sections = navigationFor(user);

  function toggleSidebar() {
    setCollapsed((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(preferenceKey, String(next));
      } catch {
        // Preferencia opcional, sin impacto sobre la sesión.
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar
        collapsed={collapsed}
        home={homeForUser(user)}
        pathname={pathname}
        sections={sections}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          collapsed={collapsed}
          onToggleSidebar={toggleSidebar}
          pathname={pathname}
          sections={sections}
          user={user}
        />
        <main
          className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 xl:px-10"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
