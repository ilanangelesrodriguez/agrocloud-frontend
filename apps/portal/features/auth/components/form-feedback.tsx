"use client";

import { Alert } from "@heroui/react";

export function FormFeedback({
  message,
  success = false,
}: {
  message?: string | null;
  success?: boolean;
}) {
  if (!message) return null;

  return (
    <Alert className="my-4" status={success ? "success" : "danger"}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
