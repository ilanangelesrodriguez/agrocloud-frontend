"use client";

import type { ReactNode } from "react";
import { Typography } from "@heroui/react";
import { Eyebrow } from "./eyebrow";

type Props = { eyebrow: string; title: string; description: string; children?: ReactNode };

export function PageHero({ eyebrow, title, description, children }: Props) {
  return (
    <section className="site-hero-grid border-b border-border">
      <div className="site-container relative py-16 sm:py-20 lg:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Typography.Heading level={1} className="mt-6 max-w-4xl text-4xl leading-tight sm:text-5xl">
          {title}
        </Typography.Heading>
        <Typography.Paragraph
          color="muted"
          className="mt-5 max-w-2xl text-base leading-8 sm:text-lg"
        >
          {description}
        </Typography.Paragraph>
        {children}
      </div>
    </section>
  );
}
