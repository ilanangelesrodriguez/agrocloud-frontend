"use client";

import type { ReactNode } from "react";
import { Button, Spinner } from "@heroui/react";

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <Button type="submit" variant="primary" className="mt-3 min-h-12 w-full font-semibold" isDisabled={pending}>
      {pending && <Spinner size="sm" />}{children}
    </Button>
  );
}
