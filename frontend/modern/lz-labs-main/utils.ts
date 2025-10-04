export function calculateCharacterCount(text: string): number {
  return text.length;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

import DOMPurify from 'dompurify';

export function getSafeHtml(html: string): { __html: string } {
  const sanitized = DOMPurify.sanitize(html);
  return { __html: sanitized };
}
