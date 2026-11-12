export function getPrivacyVersion(): string | undefined {
  const version = process.env.IDENTITY_PRIVACY_VERSION?.trim();
  return version && version.length <= 80 ? version : undefined;
}
