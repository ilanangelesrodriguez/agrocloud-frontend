import type { ReactNode } from "react";

import { AdminGate } from "@/features/admin/components/admin-gate";
import { AdminNavigation } from "@/features/admin/components/admin-navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)]">
        <AdminNavigation />
        <div className="min-w-0">{children}</div>
      </div>
    </AdminGate>
  );
}
