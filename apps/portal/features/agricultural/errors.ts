/** Mensajes de negocio conocidos del contrato agrícola, sin exponer detalles internos. */
export function agriculturalErrorMessage(message: unknown): string | undefined {
  if (typeof message !== "string") return undefined;
  const messages: Record<string, string> = {
    "Inspection is closed.":
      "La inspección ya no está en captura. Actualiza la información para continuar.",
    "Assigned to another inspector.": "La inspección está asignada a otro inspector.",
    "Discarded or already analyzed evidence.":
      "La evidencia fue descartada o ya tiene un análisis completado.",
    "Analysis already queued or running.":
      "El análisis ya está en cola o en ejecución. Espera a que termine.",
    "A running analysis cannot be cancelled.":
      "El análisis ya está procesándose o no tiene un trabajo pendiente que pueda cancelarse.",
    "Wait for the current analysis.":
      "Espera a que termine el análisis antes de descartar la evidencia.",
    "Evidence unavailable or analysis pending.":
      "La evidencia no está disponible para revisión o su análisis sigue pendiente.",
    "Justify a manual review without completed AI.":
      "Documenta la justificación para revisar una imagen sin análisis IA completado.",
    "Decide every detection before review.":
      "Confirma o rechaza todas las detecciones antes de guardar la revisión.",
    "Conclusion contradicts human findings.":
      "La conclusión no coincide con las detecciones y hallazgos registrados.",
    "Evidence must belong to this inspection.":
      "Selecciona una evidencia no descartada de esta inspección.",
    "Every sampled fruit needs relevant, explicitly reviewed evidence with all detections decided.":
      "Cada fruto necesita evidencia pertinente y revisada. Decide todas las detecciones y guarda la revisión de cada imagen.",
    "Human validation is required.": "Valida primero la inspección antes de emitir el dictamen.",
    "No se puede renombrar un maestro en uso. Deshabilítalo y registra un valor nuevo para conservar el historial.":
      "No se puede renombrar un maestro en uso. Deshabilítalo y registra un valor nuevo para conservar el historial.",
    "The latest decision changed.":
      "Otro supervisor actualizó el dictamen. Actualiza la vista antes de continuar.",
    "No previous decision exists.":
      "El dictamen anterior ya no coincide con la información actual. Actualiza la vista.",
    "Final decisions cannot be overwritten; use the prescribed reinspection flow.":
      "Este dictamen es definitivo. Continúa mediante la reinspección solicitada.",
    "Document the correction response.": "Documenta la respuesta a la observación anterior.",
    "Evidence reviews are missing or changed.":
      "Faltan revisiones o alguna evidencia cambió. Revisa y valida la información actual antes del dictamen.",
    "Unclosed high/critical incidents block release.":
      "Hay incidencias altas o críticas sin cerrar que impiden aprobar el lote.",
  };
  return messages[message];
}
