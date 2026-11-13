"use client";

import type { Lot } from "@/features/lots/schema";

import { toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerReception } from "./api";

/** Mantiene idénticas las query keys y la transición RECIBIDO. */
export function useReceptionMutation(lot: Lot) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (body: object) => registerReception(lot.id_lote, body),
    onSuccess: ({ data }) => {
      cache.setQueryData<{ producer: null; lot: Lot }>(
        ["agricultural", "lots", "detail", String(lot.id_lote)],
        (previous) =>
          previous
            ? { producer: null, lot: { ...previous.lot, recepcion: data, estado: "RECIBIDO" } }
            : previous,
      );
      toast.success("Recepción registrada");
      void cache.invalidateQueries({ queryKey: ["agricultural", "lots"] });
    },
    retry: false,
  });
}
