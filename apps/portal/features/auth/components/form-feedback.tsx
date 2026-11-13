"use client";

import { Alert } from "@heroui/react";

export function FormFeedback({ message, success = false }: { message?: string | null; success?: boolean }) {
  if (!message) return null;
  return (
    <Alert status={success ? "success" : "danger"} className="my-4">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
