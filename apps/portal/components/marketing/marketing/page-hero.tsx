"use client";

import type { ReactNode } from "react";

import { Typography } from "@heroui/react";

import { Eyebrow } from "./eyebrow";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  compact?: boolean;
};

export function PageHero({ eyebrow, title, description, children, compact = false }: Props) {
  const spacing = compact ? "py-8 sm:py-10 lg:py-12" : "py-10 sm:py-12 lg:py-14";

  return (
    <section className="site-hero-grid relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-50/70 via-background to-background dark:from-brand-700/10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-brand-600/10 blur-3xl"
      />
      <div className={`site-container relative ${spacing}`}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Typography.Heading
          className="mt-4 max-w-4xl text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]"
          level={1}
        >
          {title}
        </Typography.Heading>
        <Typography.Paragraph
          className="mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
          color="muted"
        >
          {description}
        </Typography.Paragraph>
        {children}
      </div>
    </section>
  );
}
