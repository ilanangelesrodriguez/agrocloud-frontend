export { reportSummary } from "@/features/agricultural/operations-schema";
export type ReportFilter = {
  from?: string;
  to?: string;
  producto?: string;
  variedad?: string;
  producer_id?: string;
};
