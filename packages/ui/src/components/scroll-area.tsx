"use client";

import type { ReactNode } from "react";
import { ScrollShadow } from "@heroui/react";

type AgroScrollAreaProps = {
  children: ReactNode;
  /** A height/max-height is necessary when scrolling vertically. */
  className?: string;
  orientation?: "vertical" | "horizontal";
  size?: number;
};

/**
 * Scroll container with HeroUI overflow hints and no visible native scrollbar.
 * Never hide document-level scrolling. Keyboard and touch scrolling are preserved.
 */
export function AgroScrollArea({
  children,
  className = "max-h-72",
  orientation = "vertical",
  size = 28,
}: AgroScrollAreaProps) {
  return (
    <ScrollShadow
      hideScrollBar
      orientation={orientation}
      size={size}
      className={`agro-scroll-area min-w-0 ${className}`}
    >
      {children}
    </ScrollShadow>
  );
}
