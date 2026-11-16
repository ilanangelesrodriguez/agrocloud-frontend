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
      <Card.Header className="space-y-1.5 px-5 pt-5 sm:px-7 sm:pt-7">
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
      <Card.Content className="p-5 sm:p-7">
        <Fieldset className="site-form-fieldset">
          <Fieldset.Legend className="sr-only">{title}</Fieldset.Legend>
          <Fieldset.Group>{children}</Fieldset.Group>
        </Fieldset>
      </Card.Content>
    </Card>
  );
}
