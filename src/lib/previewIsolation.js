/**
 * Immutable isolation guard for the public Preview deployments.
 * Hostname/path fallbacks keep the Preview local-only even if the
 * runtime-config script is missing or fails to initialise.
 */
export function isIsolatedPreview(
  config = typeof window !== 'undefined' ? window.__SUPABASE_CONFIG__ : null,
  location = typeof window !== 'undefined' ? window.location : null,
) {
  if (config?.previewOnly === true) return true;

  const hostname = String(location?.hostname || '').toLowerCase();
  const pathname = String(location?.pathname || '');

  // GitHub Pages project URL used by this isolated repository.
  const isGitHubPagesPreview = hostname === 'roohalla41-blip.github.io'
    && pathname.startsWith('/A1-Maintenance-Preview');

  // Netlify production and branch-deploy hostnames for this Preview site.
  // Keep this repository isolated even if runtime-config.js is unavailable.
  const isNetlifyPreview = hostname === 'timely-frangollo-ef7fde.netlify.app'
    || hostname.endsWith('--timely-frangollo-ef7fde.netlify.app');

  return isGitHubPagesPreview || isNetlifyPreview;
}

// Shared pure predicate used by the offline data layer and contract tests.
// Kept separate from offlineQueue.js so Node can test isolation without loading
// browser/Supabase-dependent modules.
export function isPreviewLocalOnly(config, location) {
  return isIsolatedPreview(config, location);
}
