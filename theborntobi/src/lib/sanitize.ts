/**
 * Server-side HTML sanitizer — strips script tags, event handlers,
 * and dangerous URI schemes to prevent XSS from stored detailHtml.
 */
export function sanitizeHtml(html: string): string {
  return (
    html
      // Remove <script>...</script> blocks (including multiline)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove on* event handlers from tags
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // Remove javascript: and data: URIs in href/src attributes
      .replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""')
      .replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '$1=""')
      // Remove <iframe>, <object>, <embed>, <form> tags
      .replace(/<(iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<(iframe|object|embed|form)\b[^>]*\/?>/gi, "")
  );
}
