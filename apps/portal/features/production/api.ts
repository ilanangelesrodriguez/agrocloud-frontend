import { bffRequest } from "@/lib/api/bff-client";
import { lotList } from "@/features/lots/schema";
export function fetchReleasedLots(page: number, signal: AbortSignal) {
  return bffRequest(`production/lots?page=${page}`, lotList, { signal }, "agricultural");
}
