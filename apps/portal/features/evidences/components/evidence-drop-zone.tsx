"use client";

import type { DragEvent } from "react";

import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { FiFolderPlus, FiImage, FiUploadCloud } from "react-icons/fi";

type EvidenceDropZoneProps = {
  disabled: boolean;
  maxFiles: number;
  onFiles: (files: File[]) => void;
  selectedCount: number;
};

/**
 * Zona de arrastre inspirada en el patrón Drop Zone de HeroUI Pro.
 * Implementada con HeroUI OSS para no exigir la licencia Pro.
 * La validación y el envío de las evidencias permanecen en InspectionEvidence.
 */
export function EvidenceDropZone({
  disabled,
  maxFiles,
  onFiles,
  selectedCount,
}: EvidenceDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const reduceMotion = useReducedMotion();
  const full = selectedCount >= maxFiles;
  const unavailable = disabled || full;

  function acceptsFiles(event: DragEvent<HTMLDivElement>) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  function onDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!acceptsFiles(event) || unavailable) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!acceptsFiles(event)) return;
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = unavailable ? "none" : "copy";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (unavailable) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) onFiles(files);
  }

  return (
    <div
      aria-label="Zona de carga de fotografías"
      className="min-w-0"
      role="group"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        accept="image/jpeg,image/png,image/webp"
        aria-hidden="true"
        className="sr-only"
        disabled={unavailable}
        multiple
        tabIndex={-1}
        type="file"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          if (files.length > 0) onFiles(files);
          event.currentTarget.value = "";
        }}
      />
      <motion.div
        animate={{ scale: dragging && !reduceMotion ? 1.012 : 1 }}
        className={
          "relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-[border-color,background-color,box-shadow] duration-200 sm:px-6 " +
          (dragging
            ? "border-accent bg-accent/10 shadow-md shadow-accent/10"
            : unavailable
              ? "border-border/70 bg-surface-secondary/50"
              : "border-border bg-surface-secondary/40 hover:border-accent/50 hover:bg-accent/5")
        }
        initial={false}
        transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-9 -top-10 size-36 rounded-full bg-accent/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-14 size-36 rounded-full bg-accent/5 blur-3xl"
        />
        <span className="relative grid size-14 place-items-center rounded-2xl border border-accent/15 bg-accent/10 text-accent">
          {dragging ? (
            <FiImage aria-hidden="true" className="size-6" />
          ) : (
            <FiUploadCloud aria-hidden="true" className="size-7" />
          )}
        </span>
        <h4 className="relative mt-4 text-base font-semibold text-foreground sm:text-lg">
          {dragging
            ? "Suelta las fotografías para agregarlas"
            : full
              ? "Has alcanzado el límite de fotografías"
              : "Arrastra tus fotografías aquí"}
        </h4>
        <p className="relative mt-1 max-w-xs text-sm leading-6 text-muted">
          {full
            ? "Quita fotografías de la lista para seleccionar otras."
            : "También puedes seleccionarlas desde tu equipo. Podrás revisar cada imagen antes de subirla."}
        </p>
        <Button
          className="relative mt-5 min-h-10 rounded-xl"
          isDisabled={unavailable}
          type="button"
          variant="secondary"
          onPress={() => inputRef.current?.click()}
        >
          <FiFolderPlus aria-hidden="true" className="size-4" />
          Seleccionar fotografías
        </Button>
        <div className="relative mt-5 flex flex-wrap justify-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-border bg-surface px-2.5 py-1">
            JPG, PNG o WebP
          </span>
          <span className="rounded-full border border-border bg-surface px-2.5 py-1">
            Máximo 3 MB por foto
          </span>
          <span className="rounded-full border border-border bg-surface px-2.5 py-1 tabular-nums">
            {selectedCount} de {maxFiles} seleccionadas
          </span>
        </div>
      </motion.div>
      <p aria-live="polite" className="sr-only" role="status">
        {dragging ? "Suelta los archivos para seleccionarlos." : ""}
      </p>
    </div>
  );
}
