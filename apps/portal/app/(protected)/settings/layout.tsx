import type { ReactNode } from "react";

import { SettingsShell } from "@/features/company/components/settings-shell";

export default function Layout({ children }: { children: ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
