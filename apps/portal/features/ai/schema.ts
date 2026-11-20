import { z } from "zod";
const count = z.coerce.number().int().nonnegative();
const metric = z.number().nullable();
export const aiModel = z.object({
  family: z.string().nullable(),
  task: z.string(),
  inference_model_id: z.string(),
  training_model_id: z.string(),
  dataset_version: z.number().nullable(),
  provider: z.string(),
  mode: z.string(),
  threshold: z.number(),
  high_confidence: z.number(),
  classes: z.array(z.string()),
  evaluation_id: z.string().nullable(),
  evaluation_matches_configured: z.boolean(),
  requires_human_review: z.boolean(),
  max_image_bytes: count,
  max_image_pixels: count,
  max_batch_size: count,
  max_concurrent_inferences: count,
  provider_timeout_seconds: count,
});
const metadata = z.object({
  project: z.string(),
  dataset_version: z.number(),
  model_architecture: z.string(),
  model_id: z.string(),
  evaluation_id: z.string(),
  evaluation_created_at: z.string(),
  evaluation_url: z.string(),
});
const metrics = z.object({
  map50: metric,
  map50_95: metric,
  map75: metric.optional(),
  precision: metric.optional(),
  recall: metric.optional(),
  f1_reported: metric.optional(),
  median_latency_ms: metric.optional(),
});
const classMetrics = z.object({
  class_name: z.string(),
  map50: metric,
  map50_95: metric.optional(),
  precision: metric,
  recall: metric,
  f1: metric,
  ground_truth_instances: count.optional(),
});
export const aiEvaluation = z.object({
  metadata,
  dataset: z.object({
    images: count,
    annotations: count,
    splits: z.record(z.string(), count),
    annotations_by_class: z.record(z.string(), count),
    test_annotations_by_class: z.record(z.string(), count),
  }),
  test_metrics: metrics,
  validation_metrics: metrics,
  per_class_test: z.array(classMetrics),
  per_class_validation: z.array(classMetrics),
  warnings: z.array(z.string()),
});
export const aiVersions = z.object({
  versions: z.array(z.object({ version: count, metadata, metrics, is_configured: z.boolean() })),
  configured_model_id: z.string(),
});
export const confusionMatrix = z.object({
  evaluation_id: z.string(),
  split: z.string(),
  confidence_threshold: z.number(),
  classes: z.array(z.string()),
  matrix: z.array(z.array(count)),
  axis_description: z.string(),
  note: z.string(),
});
export const technicalOverview = z.object({
  total: count,
  completed: count,
  failed: count,
  processing: count,
  success_rate_percent: metric,
  mean_total_ms: metric,
  p50_total_ms: metric,
  p95_total_ms: metric,
  mean_provider_ms: metric,
  mean_detections: metric,
  note: z.string(),
});
export const technicalClasses = z.object({
  days: count,
  classes: z.array(z.object({ class_name: z.string(), count, mean_confidence: z.number() })),
  note: z.string(),
});
export const technicalDaily = z.object({
  timezone: z.string(),
  days: count,
  items: z.array(z.object({ day: z.string(), completed: count, failed: count, processing: count })),
});
export const technicalErrors = z.object({
  days: count,
  errors: z.array(z.object({ error_type: z.string().nullable(), count })),
});
export const inferencePage = z.object({
  total: count,
  limit: count,
  offset: count,
  items: z.array(
    z.object({
      request_id: z.uuid(),
      status: z.enum(["processing", "completed", "failed"]),
      created_at: z.string(),
      model_id: z.string(),
      threshold: metric.optional(),
      detection_count: count,
      total_ms: metric,
      error_type: z.string().nullable(),
    }),
  ),
});
export const inferenceResult = z.object({
  request_id: z.uuid(),
  status: z.literal("completed"),
  model_id: z.string(),
  threshold: z.number(),
  detections: z.array(z.object({ id: z.string(), class_name: z.string(), confidence: z.number() })),
  summary: z.object({ total_detections: count, conclusion: z.string() }),
});
export const aiHealth = z.object({ status: z.string() });
export const aiReady = z.object({
  ready: z.boolean(),
  configuration: z.boolean(),
  database: z.boolean(),
  live_inference_checked: z.boolean(),
});
const company = <T extends z.ZodType>(data: T) =>
  z.object({ scope: z.literal("company"), timezone: z.string(), data, note: z.string() });
export const companyOverview = company(
  z.object({
    evidences: count,
    analyzed: count,
    processing: count,
    failed: count,
    detections: count,
    confirmed: count,
    discarded: count,
    pending: count,
  }),
);
export const companyClasses = company(
  z.array(
    z.object({
      class_name: z.string(),
      detections: count,
      mean_confidence: z.coerce.number().nullable(),
      confirmed: count,
      discarded: count,
      pending: count,
    }),
  ),
);
export const companyDaily = company(
  z.array(z.object({ day: z.string(), evidences: count, analyzed: count, failed: count })),
);
export const companyModels = company(z.array(z.object({ model_id: z.string(), evidences: count })));
export const companyValidation = company(
  z.object({ confirmed: count, discarded: count, pending: count }),
);

export const companyAiProducers = z.object({
  data: z.array(z.object({ id_productor: count, nombre_razon_social: z.string() })),
  meta: z.object({ current_page: count, last_page: count }),
});
