"use client";

import type { ReactNode } from "react";

import { Chip } from "@heroui/react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Chip className="font-semibold" color="accent" size="sm" variant="soft">
      {children}
    </Chip>
  );
}
