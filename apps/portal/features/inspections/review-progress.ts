import type { z } from "zod";
import type { inspectionDetail } from "@/features/agricultural/inspection";
import type { Lot } from "@/features/lots/schema";
export type ServerReviewProgress = NonNullable<NonNullable<Lot["workflow"]>["evidenceProgress"]>;
export function inspectionReviewStats(
  inspection: z.infer<typeof inspectionDetail>["data"],
  progress?: ServerReviewProgress,
) {
  const photos = inspection.evidencias ?? [];
  const relevant = photos.filter((photo) => photo.pertinencia !== "INVALIDA");
  const saved = relevant.filter(
    (photo) =>
      photo.pertinencia === "VALIDA" &&
      photo.reviewed_at &&
      !["EN_COLA", "PROCESANDO"].includes(photo.estado_ia ?? ""),
  );
  const total = progress?.sampled_fruits ?? inspection.muestreo?.tamano_muestra;
  const reviewed = progress?.reviewed_photos;
  return {
    registered: photos.length,
    relevant: progress?.relevant_photos ?? relevant.length,
    discarded: photos.length - relevant.length,
    reviewed,
    saved: saved.length,
    pending:
      reviewed === undefined
        ? undefined
        : Math.max(0, (progress?.relevant_photos ?? relevant.length) - reviewed),
    covered: progress?.captured_fruits ?? new Set(relevant.map((photo) => photo.id_fruto)).size,
    total,
    ready: progress?.complete === true,
    verified: !!progress,
  };
}
