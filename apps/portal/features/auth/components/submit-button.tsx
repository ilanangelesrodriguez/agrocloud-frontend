"use client";

import type { ReactNode } from "react";

import { Button, Spinner } from "@heroui/react";

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <Button
      className="mt-3 min-h-12 w-full font-semibold"
      isDisabled={pending}
      type="submit"
      variant="primary"
    >
      {pending && <Spinner size="sm" />}
      {children}
    </Button>
  );
}
