import { Card, Chip, Typography } from "@heroui/react";

type Props = { number: string; title: string; description: string; tag?: string };

export function FeatureCard({ number, title, description, tag }: Props) {
  return (
    <Card className="site-card group h-full">
      <Card.Content className="flex h-full flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 font-mono font-semibold text-brand-700 dark:bg-brand-700/15 dark:text-brand-400">
            {number}
          </span>
          {tag && (
            <Chip variant="soft" size="sm" color="default">
              {tag}
            </Chip>
          )}
        </div>
        <div className="space-y-3">
          <Typography.Heading level={3} className="text-lg">
            {title}
          </Typography.Heading>
          <Typography.Paragraph size="sm" color="muted" className="leading-7">
            {description}
          </Typography.Paragraph>
        </div>
      </Card.Content>
    </Card>
  );
}
