"use client";

import type { ThemeProviderProps } from "next-themes";

import { ThemeProvider } from "next-themes";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      {...themeProps}
    >
      {children}
    </ThemeProvider>
  );
}
