import type { ReactNode } from "react";

import { Card, Fieldset, Typography } from "@heroui/react";

type Props = {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function FormSection({ step, title, description, children }: Props) {
  return (
    <Card className="site-card">
      <Card.Header className="space-y-2 px-6 pt-6 sm:px-8 sm:pt-8">
        <Typography.Paragraph className="font-mono font-semibold text-accent" size="xs">
          {step}
        </Typography.Paragraph>
        <Typography.Heading className="text-xl" level={2}>
          {title}
        </Typography.Heading>
        <Typography.Paragraph color="muted" size="sm">
          {description}
        </Typography.Paragraph>
      </Card.Header>
      <Card.Content className="p-6 sm:p-8">
        <Fieldset className="site-form-fieldset">
          <Fieldset.Legend className="sr-only">{title}</Fieldset.Legend>
          <Fieldset.Group>{children}</Fieldset.Group>
        </Fieldset>
      </Card.Content>
    </Card>
  );
}
