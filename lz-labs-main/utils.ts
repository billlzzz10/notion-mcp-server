export function calculateCharacterCount(text: string): number {
  return text.length;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getSafeHtml(html: string): { __html: string } {
  // Basic HTML sanitization - in a real app, use a proper library like DOMPurify
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
  
  return { __html: sanitized };
}
