import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotForm } from "@/features/auth/components/forgot-form";

export const metadata: Metadata = { title: "Recuperar acceso", robots: { index: false, follow: false } };

export default function Page() {
  return <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Cargando…</div>}><ForgotForm /></Suspense>;
}
