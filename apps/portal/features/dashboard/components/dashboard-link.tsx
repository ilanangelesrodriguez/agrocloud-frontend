import type { IconType } from "react-icons";
import Link from "next/link";
import { Card } from "@heroui/react";
import { FiArrowUpRight } from "react-icons/fi";

export const dashboardLinkClass =
  "inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function DashboardLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: IconType;
}) {
  return (
    <Link
      href={href}
      className="group min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Card className="h-full rounded-2xl border border-border bg-surface shadow-sm transition-colors group-hover:border-accent/40 group-hover:bg-accent/5">
        <Card.Content className="flex flex-row items-start gap-3 p-5">
          <span className="shrink-0 rounded-xl bg-accent/10 p-3 text-accent">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
          </div>
          <FiArrowUpRight
            aria-hidden="true"
            className="mt-1 size-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </Card.Content>
      </Card>
    </Link>
  );
}
