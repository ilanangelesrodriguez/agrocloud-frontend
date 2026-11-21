export {
  evidence,
  evidenceResponse,
  evidenceMaxBytes,
  evidenceTypes,
  analysisQueued,
} from "@/features/agricultural/inspection";

import { z } from "zod";

export const analysisBatchInput = z.object({
  evidenceIds: z.array(z.number().int().positive()).min(1).max(100),
  idempotencyKey: z.string().uuid(),
});
export const analysisBatch = z.object({
  batchId: z.string().uuid(),
  status: z.enum(["PROCESSING", "COMPLETED", "FAILED"]),
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  processing: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
  stalled: z.boolean(),
  items: z.array(
    z.object({
      evidenceId: z.number().int().positive(),
      status: z.string(),
      stage: z.string(),
      attempts: z.number().int().nonnegative(),
      errorCode: z.string().nullable(),
      nextAttemptAt: z.string().nullable(),
      updatedAt: z.string(),
    }),
  ),
});
