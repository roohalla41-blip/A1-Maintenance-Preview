// Isolated preview configuration. No production credentials or database endpoint.
// previewOnly is checked by the auth, local-data, and Supabase client layers.
window.__SUPABASE_CONFIG__ = { url: null, key: null, previewOnly: true };
