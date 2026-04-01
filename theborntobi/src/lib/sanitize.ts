import DOMPurify from "isomorphic-dompurify";

/**
 * Server-side HTML sanitizer — uses DOMPurify to prevent XSS from stored detailHtml.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
