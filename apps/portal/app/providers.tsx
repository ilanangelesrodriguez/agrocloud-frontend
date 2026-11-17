"use client";

import type { ReactNode } from "react";
import type { ThemeProviderProps } from "next-themes";

import { useState } from "react";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toast, toast } from "@heroui/react";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

export interface ProvidersProps {
  children: ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (!mutation.options.onError && !mutation.meta?.handlesErrorToast) {
              toast.danger("No se pudo completar la operación", { description: error.message });
            }
          },
        }),
        defaultOptions: {
          queries: { retry: false, staleTime: 30_000, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <ThemeProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
      {...themeProps}
    >
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          {children}
          <Toast.Provider maxVisibleToasts={3} placement="bottom end" />
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
