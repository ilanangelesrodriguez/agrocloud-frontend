"use client";

import Link from "next/link";
import { Card, Chip, Typography } from "@heroui/react";
import { FiArrowRight, FiCheck } from "react-icons/fi";

type Props = {
  actionLabel: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  disabledAction?: boolean;
  href: string;
  price?: string;
  tag: string;
  title: string;
};

export function PlanCard({
  actionLabel,
  description,
  features,
  highlighted = false,
  disabledAction = false,
  href,
  price,
  tag,
  title,
}: Props) {
  return (
    <Card
      className={`site-card relative h-full gap-0 overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 ${
        highlighted
          ? "border border-brand-600/40 shadow-xl shadow-brand-700/10"
          : "border border-brand-600/20 shadow-sm shadow-brand-700/5 hover:border-brand-600/40"
      }`}
    >
      {/* Franja de marca solo en el plan destacado */}
      {highlighted ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-700 via-[#B7F5A2] to-brand-600"
        />
      ) : null}
      <Card.Content className="flex h-full flex-col p-7 sm:p-9">
        <div>
          <Chip color={highlighted ? "accent" : "default"} size="sm" variant="soft">
            {tag}
          </Chip>
        </div>
        <Typography.Heading className="mt-5 text-2xl font-semibold" level={2}>
          {title}
        </Typography.Heading>
        {/* El precio va justo debajo del título para que quede a la misma altura en todas las tarjetas */}
        {price ? (
          <Typography.Paragraph className="mt-3 text-3xl font-semibold tabular-nums text-brand-700 dark:text-brand-400">
            {price}
          </Typography.Paragraph>
        ) : null}
        {/* md:min-h-14 reserva 2 líneas (2 × 28px) para que las listas empiecen a la misma altura */}
        <Typography.Paragraph className="mt-3 text-sm leading-7 text-muted md:min-h-14">
          {description}
        </Typography.Paragraph>

        <ul className="mt-7 flex-1 space-y-3 border-t border-border pt-7">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-foreground">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-600/10 text-brand-700 dark:bg-brand-700/25 dark:text-brand-400"
              >
                <FiCheck className="size-3" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {disabledAction ? (
          <span
            aria-disabled="true"
            className="site-button mt-8 w-full cursor-not-allowed justify-center border border-border bg-surface-secondary text-muted"
            role="status"
          >
            Solicitudes temporalmente cerradas
          </span>
        ) : (
          <Link
            className={`site-button mt-8 w-full justify-center ${
              highlighted ? "site-button-primary" : "site-button-outline"
            }`}
            href={href}
          >
            {actionLabel}
            <FiArrowRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </Card.Content>
    </Card>
  );
}
