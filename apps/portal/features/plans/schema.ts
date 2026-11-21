import { z } from "zod";

export const offerKey = z.string().regex(/^[A-Za-z0-9_-]{1,60}$/);
export const kinds = ["PLAN", "RENEWAL", "USER_ADDON", "LOT_ADDON", "AI_ADDON"] as const;
export const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const limits = z.object({
  usuarios: z.number().int().min(1).max(1e9),
  lotes: z.number().int().min(0).max(1e9),
  analisis_ia: z.number().int().min(0).max(1e9),
});
const terms = z.object({
  kind: z.enum(kinds),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  amount_cents: z.number().int().min(100).max(999900),
  plan: z
    .string()
    .regex(/^[A-Z0-9_]{1,100}$/)
    .optional(),
  duration_days: z.number().int().min(1).max(366).optional(),
  limits: limits.optional(),
  quantity: z.number().int().min(1).max(1000000).optional(),
  public: z.boolean(),
  valid_from: z.iso.date().optional(),
  valid_until: z.iso.date().optional(),
});

export const offerInput = terms
  .extend({ status: z.enum(statuses) })
  .superRefine((value, context) => {
    const plan = value.kind === "PLAN" || value.kind === "RENEWAL";

    if (
      plan
        ? !value.plan ||
          value.plan === "GRATUITO" ||
          !value.duration_days ||
          !value.limits ||
          value.quantity !== undefined
        : !value.quantity ||
          value.plan !== undefined ||
          value.duration_days !== undefined ||
          value.limits !== undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "Completa los cupos y la duración del plan, o la cantidad del complemento.",
      });
    }
    if (value.valid_from && value.valid_until && value.valid_from >= value.valid_until) {
      context.addIssue({
        code: "custom",
        message: "El fin de vigencia debe ser posterior al inicio.",
      });
    }
  });
const offer = z.object({
  key: offerKey,
  version: z.number().int().positive(),
  status: z.enum(statuses),
  terms,
  actor_id: z.number().int().nullish(),
  created_at: z.string(),
});

export const offerList = z.object({ data: z.array(offer) });
export const offerDetail = z.object({ data: offer });
export type Offer = z.infer<typeof offer>;
const purchase = z.object({
  reference: z.string(),
  amount_cents: z.number().int(),
  currency: z.literal("PEN"),
  kind: z.enum(kinds),
});

export const companyOffers = z.object({
  data: z.array(
    terms
      .partial({ name: true, public: true })
      .extend({ key: offerKey, currency: z.literal("PEN") }),
  ),
  pending_order: purchase.extend({ offer_key: offerKey }).nullable(),
});
export const orderResponse = purchase;
export const money = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

/** Estado autorizado por Identity, no inferido del resultado visible de Culqi. */
export const orderStatus = z.object({
  reference: z.string(),
  offer_key: offerKey,
  amount_cents: z.number().int(),
  currency: z.literal("PEN"),
  kind: z.enum(kinds),
  status: z.string(),
  payment_state: z.enum([
    "READY",
    "DECLINED",
    "PROCESSING",
    "REQUIRES_3DS",
    "RECONCILIATION_REQUIRED",
    "AWAITING_CONFIRMATION",
    "CONFIRMED",
    "UNAVAILABLE",
  ]),
});
export const authentication3DS = z
  .object({
    eci: z.string().regex(/^\d{2}$/),
    xid: z.string().regex(/^[A-Za-z0-9+/=_-]{1,256}$/),
    cavv: z.string().regex(/^[A-Za-z0-9+/=_-]{1,256}$/),
    protocolVersion: z.string().regex(/^[12]\.\d{1,2}\.\d{1,2}$/),
    directoryServerTransactionId: z.string().uuid().optional(),
  })
  .superRefine((value, context) => {
    if (value.protocolVersion.startsWith("2.") && !value.directoryServerTransactionId)
      context.addIssue({
        code: "custom",
        path: ["directoryServerTransactionId"],
        message: "Falta la transacción 3DS.",
      });
  });
export const chargeInput = z.object({
  token_id: z
    .string()
    .max(128)
    .regex(/^tkn_test_[A-Za-z0-9]+$/),
  device_fingerprint_id: z.string().uuid(),
});
export const completeAuthenticationInput = chargeInput.extend({
  attempt_id: z.string().regex(/^[a-f0-9]{24}$/),
  authentication_3ds: authentication3DS,
});
export const chargeResponse = z.discriminatedUnion("status", [
  z.object({ reference: z.string(), status: z.literal("PENDING"), message: z.string() }),
  z.object({
    reference: z.string(),
    status: z.literal("REQUIRES_3DS"),
    message: z.string(),
    attempt_id: z.string().regex(/^[a-f0-9]{24}$/),
    authentication_expires_at: z.string().datetime(),
  }),
]);
