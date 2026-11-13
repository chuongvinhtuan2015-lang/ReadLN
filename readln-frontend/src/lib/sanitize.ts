import DOMPurify from 'dompurify';

/**
 * Làm sạch văn bản tránh tấn công Stored XSS / DOM XSS
 */
export function sanitizeHtml(rawHtml: string): string {
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

