"use client";

import Link from "next/link";
import { Card, Chip, Typography } from "@heroui/react";
import {
  FiArrowRight,
  FiCalendar,
  FiCpu,
  FiGift,
  FiLayers,
  FiPackage,
  FiUsers,
} from "react-icons/fi";

type Limits = { usuarios: number; lotes: number; analisis_ia: number };

type Props = {
  actionLabel: string;
  description: string;
  disabledAction?: boolean;
  durationDays?: number;
  highlighted?: boolean;
  href: string;
  kind: "free" | "paid";
  limits?: Limits;
  price: string;
  tag: string;
  title: string;
};

const numberFormat = new Intl.NumberFormat("es-PE");

export function PlanCard({
  actionLabel,
  description,
  disabledAction = false,
  durationDays,
  highlighted = false,
  href,
  kind,
  limits,
  price,
  tag,
  title,
}: Props) {
  const Icon = kind === "free" ? FiGift : FiLayers;
  const metrics = [
    {
      icon: FiCalendar,
      label: "Vigencia",
      value: durationDays ? numberFormat.format(durationDays) + " días" : "Por confirmar",
    },
    {
      icon: FiUsers,
      label: "Usuarios",
      value: limits ? numberFormat.format(limits.usuarios) : "—",
    },
    { icon: FiPackage, label: "Lotes", value: limits ? numberFormat.format(limits.lotes) : "—" },
    {
      icon: FiCpu,
      label: "Análisis IA",
      value: limits ? numberFormat.format(limits.analisis_ia) : "—",
    },
  ];

  return (
    <Card
      className={
        "site-card group relative h-full overflow-hidden rounded-3xl border p-0 transition-[border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-md " +
        (highlighted
          ? "border-brand-600/35 bg-surface shadow-md shadow-brand-700/10 hover:border-brand-600/55"
          : "border-border bg-surface shadow-sm shadow-brand-700/5 hover:border-brand-600/35")
      }
    >
      {highlighted ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-700 via-[#B7F5A2] to-brand-600"
        />
      ) : null}
      <Card.Content className="flex h-full flex-col p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <Chip color={highlighted ? "accent" : "default"} size="sm" variant="soft">
            {tag}
          </Chip>
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400">
            <Icon aria-hidden="true" className="size-5" />
          </div>
        </div>
        <div className="mt-5">
          <Typography.Heading
            className="break-words text-xl font-semibold tracking-tight sm:text-2xl"
            level={2}
          >
            {title}
          </Typography.Heading>
          <Typography.Paragraph className="mt-2 min-h-14 text-sm leading-6 text-muted">
            {description}
          </Typography.Paragraph>
        </div>
        <div className="mt-5 rounded-2xl border border-brand-600/10 bg-brand-50/40 px-4 py-4 dark:bg-brand-700/10">
          <p className="text-xs font-medium text-muted">
            {kind === "free" ? "Precio de acceso" : "Precio de la oferta"}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-brand-700 sm:text-4xl dark:text-brand-400">
            {price}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {kind === "free"
              ? "Sin pago por activar el acceso gratuito"
              : "Condiciones vigentes al confirmar la contratación"}
          </p>
        </div>
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Incluye</p>
          <dl className="grid grid-cols-2 gap-2.5">
            {metrics.map(({ icon: MetricIcon, label, value }) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-border/80 bg-surface-secondary/60 px-3 py-3"
              >
                <dt className="flex items-center gap-1.5 text-xs text-muted">
                  <MetricIcon aria-hidden="true" className="size-3.5 shrink-0 text-accent" />
                  {label}
                </dt>
                <dd className="mt-1.5 break-words text-base font-semibold tabular-nums text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-auto pt-6">
          {disabledAction ? (
            <button
              className="site-button w-full cursor-not-allowed justify-center border border-border bg-surface-secondary text-muted"
              disabled
              type="button"
            >
              Registro temporalmente cerrado
            </button>
          ) : (
            <Link
              className={
                "site-button w-full justify-center " +
                (highlighted ? "site-button-primary" : "site-button-outline")
              }
              href={href}
            >
              {actionLabel}
              <FiArrowRight aria-hidden="true" className="size-4" />
            </Link>
          )}
          <p className="mt-3 text-center text-xs leading-5 text-muted">
            {kind === "free"
              ? "Sujeto a revisión y aprobación empresarial."
              : "Elegir el plan no realiza ningún cobro."}
          </p>
        </div>
      </Card.Content>
    </Card>
  );
}
