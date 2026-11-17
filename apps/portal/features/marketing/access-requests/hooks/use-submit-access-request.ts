"use client";

import { useMutation } from "@tanstack/react-query";

import { sendAccessRequest } from "../api";

export function useSubmitAccessRequest() {
  return useMutation({ mutationFn: sendAccessRequest, meta: { handlesErrorToast: true }, retry: 0 });
}
