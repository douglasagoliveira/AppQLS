/**
 * Escapa texto digitado pelo usuário antes de interpolá-lo em HTML (PDF via expo-print).
 * Evita quebra de layout e injeção de tags/atributos.
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

/** Permite apenas URLs http(s) em atributos src/href. */
export function safeUrl(value: unknown): string {
  const url = String(value ?? '').trim();
  return /^https?:\/\//i.test(url) ? escapeHtml(url) : '';
}
