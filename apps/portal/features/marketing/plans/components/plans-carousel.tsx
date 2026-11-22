"use client";

import type { ReactNode } from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

type Props = {
  items: ReactNode[];
};

export function PlansCarousel({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(1);
  const [firstVisible, setFirstVisible] = useState(0);
  const lastStart = Math.max(0, items.length - visibleCount);
  const canScroll = items.length > visibleCount;

  const moveTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;

      const targetIndex = Math.max(0, Math.min(index, lastStart));
      const slides = track.querySelectorAll<HTMLElement>("[data-plan-slide]");
      const slide = slides[targetIndex];
      if (!slide) return;

      const left =
        slide.getBoundingClientRect().left -
        track.getBoundingClientRect().left +
        track.scrollLeft;

      track.scrollTo({ left, behavior: reduceMotion ? "instant" : "smooth" });
      setFirstVisible(targetIndex);
    },
    [lastStart, reduceMotion],
  );

  const updatePosition = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const slides = track.querySelectorAll<HTMLElement>("[data-plan-slide]");
    if (slides.length < 2) {
      setFirstVisible(0);
      return;
    }

    const distance = slides[1].offsetLeft - slides[0].offsetLeft;
    if (distance <= 0) return;

    const next = Math.max(0, Math.min(lastStart, Math.round(track.scrollLeft / distance)));
    setFirstVisible((previous) => (previous === next ? previous : next));
  }, [lastStart]);

  useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 768px)");
    const updateLayout = () => {
      setVisibleCount(breakpoint.matches ? 2 : 1);
      setFirstVisible(0);
      trackRef.current?.scrollTo({ left: 0, behavior: "instant" });
    };

    updateLayout();
    breakpoint.addEventListener("change", updateLayout);
    return () => breakpoint.removeEventListener("change", updateLayout);
  }, []);

  const move = (direction: -1 | 1) => moveTo(firstVisible + direction * visibleCount);

  return (
    <div className="min-w-0">
      {canScroll ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-5 text-muted">
            <span className="font-semibold text-foreground">
              Planes {firstVisible + 1}–{Math.min(firstVisible + visibleCount, items.length)}
            </span>
            {" de "}
            {items.length}
            <span className="ml-2 hidden sm:inline">Explora las demás modalidades.</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              aria-controls="planes-disponibles"
              aria-label="Ver planes anteriores"
              className="size-10 rounded-xl border border-border bg-surface text-foreground"
              isDisabled={firstVisible === 0}
              variant="secondary"
              onPress={() => move(-1)}
            >
              <FiArrowLeft aria-hidden="true" className="size-4" />
            </Button>
            <Button
              isIconOnly
              aria-controls="planes-disponibles"
              aria-label="Ver más planes"
              className="size-10 rounded-xl border border-border bg-surface text-foreground"
              isDisabled={firstVisible === lastStart}
              variant="secondary"
              onPress={() => move(1)}
            >
              <FiArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <div
        ref={trackRef}
        aria-label="Comparación de planes de AgroCloud"
        aria-roledescription="carrusel"
        className="flex min-w-0 snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overscroll-x-contain rounded-2xl pb-3 scroll-smooth outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent motion-reduce:scroll-auto md:gap-6 [&::-webkit-scrollbar]:hidden"
        id="planes-disponibles"
        role="region"
        style={{ scrollbarWidth: "none" }}
        tabIndex={canScroll ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
        onScroll={updatePosition}
      >
        {items.map((item, index) => (
          <div
            key={index}
            aria-label={"Plan " + (index + 1) + " de " + items.length}
            aria-roledescription="diapositiva"
            className="min-w-0 basis-full shrink-0 snap-start md:basis-[calc((100%-1.5rem)/2)]"
            data-plan-slide=""
            role="group"
          >
            {item}
          </div>
        ))}
      </div>

      {canScroll ? (
        <div className="mt-3 flex items-center justify-between gap-4">
          <div
            aria-hidden="true"
            className="h-1.5 w-24 overflow-hidden rounded-full bg-brand-600/15 sm:w-32"
          >
            <motion.div
              animate={{ scaleX: (firstVisible + visibleCount) / items.length }}
              className="h-full w-full origin-left rounded-full bg-brand-700 dark:bg-brand-400"
              initial={false}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-muted">
            <span className="md:hidden">Desliza para comparar otros planes</span>
            <span className="hidden md:inline">Utiliza las flechas para comparar más opciones</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
