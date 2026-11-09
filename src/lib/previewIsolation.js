/**
 * Immutable isolation guard for the public GitHub Pages preview.
 * The hostname/path fallback keeps the preview local-only even if the
 * runtime-config script is missing or fails to initialise.
 */
export function isIsolatedPreview(
  config = typeof window !== 'undefined' ? window.__SUPABASE_CONFIG__ : null,
  location = typeof window !== 'undefined' ? window.location : null,
) {
  if (config?.previewOnly === true) return true;
  const hostname = String(location?.hostname || '').toLowerCase();
  const pathname = String(location?.pathname || '');
  return hostname === 'roohalla41-blip.github.io'
    && pathname.startsWith('/A1-Maintenance-Preview');
}
