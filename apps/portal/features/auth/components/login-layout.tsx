"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiLayers, FiShield, FiTrendingUp } from "react-icons/fi";
import { ThemeSwitch } from "@/components/theme-switch";

const benefits = [
  {
    icon: FiLayers,
    title: "Tu operación, en un solo lugar",
    text: "Organiza productores, lotes y recepciones con información conectada.",
  },
  {
    icon: FiCheckCircle,
    title: "Calidad en cada etapa",
    text: "Da seguimiento a muestreos, inspecciones y evidencias de tu operación.",
  },
  {
    icon: FiTrendingUp,
    title: "Decisiones con más contexto",
    text: "Consulta la trazabilidad y acompaña a tu equipo desde cualquier lugar.",
  },
];

export function LoginLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid min-h-dvh min-w-0 bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative hidden min-w-0 flex-col overflow-hidden bg-[#0b3f32] px-10 py-10 text-white lg:flex xl:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 size-[36rem] rounded-full border border-white/10 bg-white/[0.03]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-64 -left-32 size-[40rem] rounded-full border border-white/10"
        />
        <Link
          href="/"
          className="relative inline-flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Image src="/agrocloud/logo-mark.svg" alt="" width={44} height={44} />
          <span className="text-xl font-semibold tracking-tight">
            AgroCloud <span className="text-[#b7f5a2]">AI</span>
          </span>
        </Link>
        <div className="relative my-auto max-w-xl py-12 xl:py-16">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#b7f5a2]">
            Gestión agrícola y calidad postcosecha
          </p>
          <h2 className="text-4xl font-semibold leading-[1.12] tracking-tight xl:text-5xl">
            Conecta tu campo.
            <br />
            <span className="text-[#b7f5a2]">Impulsa tu operación.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/75">
            AgroCloud reúne a tu equipo y la información de tu empresa para gestionar cada etapa con
            claridad.
          </p>
          <ul className="mt-10 space-y-6">
            {benefits.map(({ icon: Icon, title: benefit, text }) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                  <Icon aria-hidden="true" className="size-5 text-[#b7f5a2]" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{benefit}</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-white/65">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <section className="flex min-w-0 flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <FiArrowLeft aria-hidden="true" /> Volver al sitio web
          </Link>
          <ThemeSwitch />
        </div>
        <div className="mx-auto my-auto w-full min-w-0 max-w-md py-10 sm:py-12">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
            <Image src="/agrocloud/logo-mark.svg" alt="" width={40} height={40} />
            <span className="text-lg font-semibold">
              AgroCloud <span className="text-accent">AI</span>
            </span>
          </Link>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
            Bienvenido a tu espacio de trabajo
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
          <div className="mt-8">{children}</div>
          {footer ? (
            <div className="mt-7 border-t border-border pt-6 text-sm leading-relaxed text-muted">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
