"use client";

import Image from "next/image";
import { Spinner } from "@heroui/react";
import { FiShield } from "react-icons/fi";

export function SessionLoading({ label = "Verificando tu sesión" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6 py-12">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="w-full max-w-sm text-center"
      >
        <div className="mx-auto mb-7 flex size-24 items-center justify-center rounded-[1.75rem] border border-accent/10 bg-accent/5">
          <Image src="/agrocloud/logo-mark.svg" width={56} height={56} alt="" priority />
        </div>
        <p className="text-xl font-semibold tracking-tight">
          AgroCloud <span className="text-accent">AI</span>
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Spinner size="sm" color="accent" />
          <p className="text-sm font-medium">{label}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          En un momento estarás en tu espacio de trabajo.
        </p>
        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-muted">
          <FiShield aria-hidden="true" /> Conexión segura con tu cuenta
        </p>
      </div>
    </div>
  );
}
