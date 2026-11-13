import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivateForm } from "@/features/auth/components/activate-form";

export const metadata: Metadata = { title: "Activar cuenta", robots: { index: false, follow: false } };

export default function Page() {
  return <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Cargando…</div>}><ActivateForm /></Suspense>;
}
