"use client";

import type { ReactNode } from "react";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      transition={{ duration: 0.42, delay }}
    >
      {children}
    </motion.div>
  );
}
