import { Alert } from "@heroui/react";

type InlineNoticeProps = {
  status?: "default" | "accent" | "success" | "warning" | "danger";
  title: string;
  description: string;
  className?: string;
};

/** Mensaje persistente en contexto; usar Toast solo para resultados temporales. */
export function InlineNotice({ status = "default", title, description, className }: InlineNoticeProps) {
  return (
    <Alert status={status} className={className}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{description}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
