import { bffRequest } from "@/lib/api/bff-client";
import { reportSummary, type ReportFilter } from "./schema";
export function fetchReport(filter: ReportFilter, signal?: AbortSignal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) if (value) params.set(key, value);
  return bffRequest("reports/summary?" + params, reportSummary, { signal }, "agricultural");
}
