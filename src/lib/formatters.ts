// Helper to format currency in Persian (e.g. ۱۲۰,۰۰۰ تومان)
export function formatPrice(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '۰';
  return Number(num).toLocaleString('fa-IR');
}

// Convert English digits to Persian digits
export function toPersianDigits(input: string | number): string {
  if (input === undefined || input === null) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (w) => '۰۱۲۳۴۵۶۷۸۹'[+w]);
}

// Format ISO date to Persian friendly date
export function formatDate(isoStr: string | undefined): string {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoStr;
  }
}
