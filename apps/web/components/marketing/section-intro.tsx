"use client";

import { Typography } from "@heroui/react";

type Props = { eyebrow: string; title: string; text?: string; center?: boolean };

export function SectionIntro({ eyebrow, title, text, center = false }: Props) {
  return (
    <div className={`space-y-4 ${center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}`}>
      <Typography.Paragraph className="font-bold uppercase tracking-[0.18em] text-accent" size="xs">
        {eyebrow}
      </Typography.Paragraph>
      <Typography.Heading className="text-3xl leading-tight tracking-tight sm:text-4xl" level={2}>
        {title}
      </Typography.Heading>
      {text && (
        <Typography.Paragraph className="text-base leading-8" color="muted">
          {text}
        </Typography.Paragraph>
      )}
    </div>
  );
}
