"use client";

import { Alert, Button, Typography } from "@heroui/react";
import { FiSend } from "react-icons/fi";

type Props = { isPending: boolean; error: string | null };

export function SubmitActions({ isPending, error }: Props) {
  return (
    <>
      {error && (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Title>No se pudo registrar la solicitud</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <Typography.Paragraph className="max-w-lg" color="muted" size="xs">
          Enviar una solicitud no garantiza su aprobación. No necesitas crear una contraseña.
        </Typography.Paragraph>
        <Button
          className="w-full justify-center sm:w-auto"
          isDisabled={isPending}
          isPending={isPending}
          size="lg"
          type="submit"
          variant="primary"
        >
          <FiSend aria-hidden="true" className="size-4" />
          {isPending ? "Enviando solicitud…" : "Enviar solicitud"}
        </Button>
      </div>
    </>
  );
}
