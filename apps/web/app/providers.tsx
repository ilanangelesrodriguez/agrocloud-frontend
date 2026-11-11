"use client";

import type { ReactNode } from "react";
import type { ThemeProviderProps } from "next-themes";

import { Toast } from "@heroui/react";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";

export interface ProvidersProps {
  children: ReactNode;
  themeProps?: ThemeProviderProps;
}

/**
 * Un único proveedor de apariencia, movimiento accesible y notificaciones
 * por aplicación. No importar ni montar otro Toast.Provider en cada pantalla.
 */
export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      {...themeProps}
    >
      <MotionConfig reducedMotion="user">
        {children}
        <Toast.Provider placement="bottom end" maxVisibleToasts={3} />
      </MotionConfig>
    </ThemeProvider>
  );
}
