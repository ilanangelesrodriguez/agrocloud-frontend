"use client";

import Link from "next/link";
import { Card, Chip, Typography } from "@heroui/react";
import { FiCheck } from "react-icons/fi";

type Props = {
  actionLabel: string;
  description: string;
  features: string[];
  highlighted?: boolean;
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
  href,
  price,
  tag,
  title,
}: Props) {
  return (
    <Card className="site-card h-full">
      <Card.Content className="flex h-full flex-col p-7 sm:p-9">
        <Chip color={highlighted ? "accent" : "default"} size="sm" variant="soft">
          {tag}
        </Chip>
        <Typography.Heading className="mt-5 text-2xl font-semibold" level={2}>
          {title}
        </Typography.Heading>
        <Typography.Paragraph className="mt-3 text-sm leading-7 text-muted">
          {description}
        </Typography.Paragraph>
        {price ? (
          <Typography.Paragraph className="mt-4 text-xl font-semibold tabular-nums">
            {price}
          </Typography.Paragraph>
        ) : null}
        <div className="mt-7 flex-1 space-y-3">
          {features.map((feature) => (
            <Typography.Paragraph
              key={feature}
              className="flex items-start gap-2.5 text-sm text-foreground"
            >
              <FiCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
              {feature}
            </Typography.Paragraph>
          ))}
        </div>
        <Link
          className={`site-button mt-8 w-full justify-center ${
            highlighted ? "site-button-primary" : "site-button-outline"
          }`}
          href={href}
        >
          {actionLabel}
        </Link>
      </Card.Content>
    </Card>
  );
}
