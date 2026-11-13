import type { ReactNode } from "react";

import { AdminGate } from "@/features/admin/components/admin-gate";

/** AppShell contiene la navegación global, no crear otro sidebar aquí. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
