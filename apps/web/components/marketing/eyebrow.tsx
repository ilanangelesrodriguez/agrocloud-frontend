import type { ReactNode } from "react";
import { Chip } from "@heroui/react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Chip color="accent" variant="soft" size="sm" className="font-semibold">
      {children}
    </Chip>
  );
}
