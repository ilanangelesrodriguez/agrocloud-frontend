import type { ReactNode } from "react";
import { Card, Typography } from "@heroui/react";

export function DemoSection({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 border border-border bg-surface">
      <Card.Header>
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </Card.Header>
      <Card.Content className="grid min-w-0 gap-5">
        {children}
      </Card.Content>
    </Card>
  );
}

export function DemoLabel({ children }: { children: ReactNode }) {
  return <Typography.Heading level={3} className="text-sm font-semibold">{children}</Typography.Heading>;
}
