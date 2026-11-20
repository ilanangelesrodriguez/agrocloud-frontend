import { z } from "zod";
export const decisionStatus = z.enum(["PENDING", "OBSERVED", "COMPLETED"]);
export { inspectionsPage } from "@/features/agricultural/operations-schema";
