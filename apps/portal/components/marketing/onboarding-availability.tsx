"use client";

import type { ReactNode } from "react";

import { createContext, useContext } from "react";

const OnboardingAvailabilityContext = createContext(false);

export function OnboardingAvailabilityProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return (
    <OnboardingAvailabilityContext.Provider value={enabled}>
      {children}
    </OnboardingAvailabilityContext.Provider>
  );
}

export function useOnboardingAvailability(): boolean {
  return useContext(OnboardingAvailabilityContext);
}
