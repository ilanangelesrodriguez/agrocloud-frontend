import { Typography } from "@heroui/react";

type Props = { eyebrow: string; title: string; text?: string; center?: boolean };

export function SectionIntro({ eyebrow, title, text, center = false }: Props) {
  return (
    <div className={`space-y-4 ${center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}`}>
      <Typography.Paragraph size="xs" className="font-bold uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </Typography.Paragraph>
      <Typography.Heading level={2} className="text-3xl leading-tight tracking-tight sm:text-4xl">
        {title}
      </Typography.Heading>
      {text && (
        <Typography.Paragraph color="muted" className="text-base leading-8">
          {text}
        </Typography.Paragraph>
      )}
    </div>
  );
}
