"use client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInbox, fetchUnread, readNotification } from "./api";

export function useUnreadNotifications(enabled: boolean) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: ({ signal }) => fetchUnread(signal),
    enabled,
    retry: false,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });
}
export function useNotifications(unread: boolean, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["notifications", "inbox", unread],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => fetchInbox(pageParam, unread, signal),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled,
    retry: false,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });
}
export function useReadNotification() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) => readNotification(id),
    retry: false,
    onSuccess: () => cache.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
