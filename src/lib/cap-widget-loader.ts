// Self-host the cap-widget WASM bundle from static/ rather than letting
// cap-widget fetch it from cdn.jsdelivr.net at runtime. Keeps the CSP
// `connect-src 'self'` and avoids a third-party dependency.
//
// Call `loadCapWidget()` from a client-only context (e.g. onMount) before
// rendering <cap-widget>. The import is dynamic so this module is safe to
// import from SSR'd Svelte components.

export async function loadCapWidget(): Promise<void> {
  window.CAP_CUSTOM_WASM_URL = '/cap_wasm_bg.wasm';
  await import('cap-widget');
}
