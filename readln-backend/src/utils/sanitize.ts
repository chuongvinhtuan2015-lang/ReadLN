import sanitizeHtmlLib from 'sanitize-html';

export function sanitizeText(text: string): string {
  if (!text) return '';
  return sanitizeHtmlLib(text, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      a: ['href', 'target'],
    },
  });
}

