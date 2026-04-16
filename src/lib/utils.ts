export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2,
  }).format(value);
}

export function titleCase(text: string): string {
  return text
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function parseDateInput(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
      const parsed = (value as { toDate: () => Date }).toDate();
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    if ('seconds' in value && typeof (value as { seconds?: number }).seconds === 'number') {
      const parsed = new Date((value as { seconds: number }).seconds * 1000);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
}

export function formatDateTime(
  value: unknown,
  locale = 'th-TH',
  options?: Intl.DateTimeFormatOptions,
): string {
  const parsed = parseDateInput(value);
  if (!parsed) return '-';

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(parsed);
}
