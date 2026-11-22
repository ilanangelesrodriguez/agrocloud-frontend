"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

/**
 * Avanza mientras el bloque es visible, sin controles de pausa.
 * La selección manual da tiempo para leer y luego continúa el recorrido.
 */
export function useMarketingAutoStep(total: number, intervalMs = 4700) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const reduceMotion = useReducedMotion();
  const manualUntil = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion || total <= 1) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || Date.now() < manualUntil.current) {
        return;
      }
      setActive((current) => (current + 1) % total);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [inView, reduceMotion, total, intervalMs]);

  const selectStep = (index: number) => {
    manualUntil.current = Date.now() + intervalMs * 1.5;
    setActive(index);
  };

  return { ref, active, selectStep, reduceMotion };
}
