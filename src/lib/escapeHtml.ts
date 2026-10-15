/**
 * Escapes user-entered text before interpolating it into HTML (PDF via expo-print).
 * Prevents layout breakage and tag/attribute injection.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Allows only http(s) URLs in src/href attributes. */
export function safeUrl(value: unknown): string {
  const url = String(value ?? '').trim();
  return /^https?:\/\//i.test(url) ? escapeHtml(url) : '';
}
