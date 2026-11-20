import type { QueryClient } from "@tanstack/react-query";
export function invalidateOperationalQueries(
  cache: QueryClient,
  options: { notifications?: boolean; subscription?: boolean } = {},
) {
  const updates = [cache.invalidateQueries({ queryKey: ["agricultural"] })];
  if (options.notifications) updates.push(cache.invalidateQueries({ queryKey: ["notifications"] }));
  if (options.subscription)
    updates.push(cache.invalidateQueries({ queryKey: ["company", "subscription"] }));
  return Promise.all(updates);
}
