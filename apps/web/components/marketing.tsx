import Link from "next/link";
import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-600/20 bg-brand-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-brand-700 dark:bg-brand-700/15 dark:text-brand-400">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-600" />
      {children}
    </span>
  );
}
export function SectionIntro({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={`space-y-4 ${center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}`}>
      <span className="text-xs font-bold uppercase tracking-[.18em] text-accent">{eyebrow}</span>
      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {text && <p className="text-base leading-8 text-muted">{text}</p>}
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="site-hero-grid border-b border-border">
      <div className="site-container relative py-16 sm:py-20 lg:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">{description}</p>
        {children}
      </div>
    </section>
  );
}
export function FeatureCard({
  number,
  title,
  description,
  tag,
}: {
  number: string;
  title: string;
  description: string;
  tag?: string;
}) {
  return (
    <article className="site-card group flex h-full flex-col gap-5 p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 font-mono text-base font-semibold text-brand-700 dark:bg-brand-700/15 dark:text-brand-400">
          {number}
        </span>
        {tag && (
          <span className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-muted">
            {tag}
          </span>
        )}
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm leading-7 text-muted">{description}</p>
      </div>
    </article>
  );
}
export function CallToAction({
  title = "Organiza la calidad de tu operación agrícola",
  text = "Cuéntanos sobre tu empresa y cómo deseas utilizar AgroCloud. Revisaremos tu solicitud de acceso.",
  button = "Solicitar acceso empresarial",
}: {
  title?: string;
  text?: string;
  button?: string;
}) {
  return (
    <section className="site-container py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#104C37] px-7 py-10 text-white sm:px-12 sm:py-14 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 size-[360px] rounded-full border-[65px] border-white/5"
        />
        <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#A5E9BE]">
              Comienza con AgroCloud
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-4 leading-7 text-white/75">{text}</p>
          </div>
          <Link
            href="/solicitar-acceso"
            className="site-button shrink-0 bg-white text-[#104C37] hover:bg-[#E7F9EB]"
          >
            {button}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
