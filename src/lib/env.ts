/**
 * Helper to determine if the application is running in AI Studio Dev Preview environment.
 * Production / Client Test URLs (such as shared app URLs or Cloud Run deployments)
 * will return false, disabling dev-only demo bypasses and developer controls.
 */
export const isDevEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return import.meta.env.DEV || hostname.includes('ais-dev');
};
