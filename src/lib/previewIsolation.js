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

// Shared pure predicate used by the offline data layer and contract tests.
// Kept separate from offlineQueue.js so Node can test isolation without loading
// browser/Supabase-dependent modules.
export function isPreviewLocalOnly(config, location) {
  return isIsolatedPreview(config, location);
}
