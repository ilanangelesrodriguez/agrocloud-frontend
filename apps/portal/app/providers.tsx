"use client";

import type { ReactNode } from "react";
import type { ThemeProviderProps } from "next-themes";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toast } from "@heroui/react";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

export interface ProvidersProps { children: ReactNode; themeProps?: ThemeProviderProps }

export function Providers({ children, themeProps }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000, refetchOnWindowFocus: false }, mutations: { retry: 0 } },
  }));
  return (
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem {...themeProps}>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          {children}
          <Toast.Provider placement="bottom end" maxVisibleToasts={3} />
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
