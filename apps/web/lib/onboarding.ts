/**
 * Public onboarding is an explicit release decision.
 * Do not enable until the privacy notice is published and end-to-end checks pass.
 */
export function isPublicOnboardingEnabled(): boolean {
  return process.env.AGROCLOUD_PUBLIC_ONBOARDING_ENABLED === "true";
}
