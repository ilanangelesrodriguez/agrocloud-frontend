/** Reexportación temporal: los esquemas pertenecen a cada módulo. */
export {
  decisionSchema,
  requestSchema,
  requestPageSchema,
  decisionResponseSchema,
} from "./access-requests/schema";
export type { AccessRequest } from "./access-requests/schema";
export { companySchema, companyPageSchema, companyResponseSchema } from "./companies/schema";
