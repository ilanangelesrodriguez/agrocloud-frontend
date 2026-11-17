"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { CreationDrawer } from "./creation-drawer";

const PanelBusyContext = createContext<((busy: boolean) => void) | undefined>(undefined);
export function usePanelBusy() {
  return useContext(PanelBusyContext);
}

/** Las rutas directas y los enlaces del listado comparten el mismo panel. */
export function RouteDrawer({
  title,
  description,
  back,
  background,
  children,
}: {
  title: string;
  description: string;
  back: string;
  background: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <>
      {background}
      <PanelBusyContext value={setBusy}>
        <CreationDrawer
          open
          busy={busy}
          title={title}
          description={description}
          onOpenChange={(open) => {
            if (!open) router.replace(back);
          }}
          trigger={null}
          closeLabel="Cerrar"
        >
          <div className="route-drawer-content">{children}</div>
        </CreationDrawer>
      </PanelBusyContext>
    </>
  );
}
