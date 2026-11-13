import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmEmailForm } from "@/features/auth/components/confirm-email-form";

export const metadata: Metadata = { title: "Confirmar correo", robots: { index: false, follow: false } };

export default function Page() {
  return <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Cargando…</div>}><ConfirmEmailForm /></Suspense>;
}
