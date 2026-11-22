"use client";

import type { ReactNode } from "react";

import { InlineNotice } from "@agrocloud/ui";
import { usePathname } from "next/navigation";

import { canAccessSetting, settingsLinks } from "../navigation";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

/** La navegación se muestra en AppShell; este componente solo aplica permisos. */
export function SettingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const active = settingsLinks.find(
    ({ href }) => pathname === href || pathname.startsWith(href + "/"),
  );

  if (active && !canAccessSetting(user, active)) {
    return (
      <InlineNotice
        description="Tu cuenta no tiene permisos para consultar esta sección."
        status="warning"
        title="Acceso restringido"
      />
    );
  }

  return (
    <div
      className={
        pathname === "/settings/notifications"
          ? "min-w-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
          : "min-w-0"
      }
    >
      {children}
    </div>
  );
}
