import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetForm } from "@/features/auth/components/reset-form";

export const metadata: Metadata = { title: "Restablecer contraseña", robots: { index: false, follow: false } };

export default function Page() {
  return <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Cargando…</div>}><ResetForm /></Suspense>;
}
