"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  className = "",
  delay = 0,
  viewport = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  viewport?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const animation = { opacity: 1, y: 0 };
  const transition = {
    duration: reduceMotion ? 0 : 0.42,
    delay: reduceMotion ? 0 : delay,
    ease: "easeOut" as const,
  };

  return (
    <motion.div
      animate={viewport ? undefined : animation}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      transition={transition}
      viewport={viewport ? { once: true, amount: 0.15 } : undefined}
      whileInView={viewport ? animation : undefined}
    >
      {children}
    </motion.div>
  );
}
