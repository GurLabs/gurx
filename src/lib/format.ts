const TR_DATE = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const TR_DATETIME = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : TR_DATE.format(d);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : TR_DATETIME.format(d);
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  finished: boolean;
}

export function countdownTo(target?: string | null, now = Date.now()): Countdown {
  const end = target ? new Date(target).getTime() : NaN;
  const total = Number.isNaN(end) ? 0 : Math.max(0, end - now);

  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
    finished: total <= 0,
  };
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Age on 31 December of the competition year — the rule the jury applies. */
export function ageFromBirthYear(birthYear: number, referenceYear = new Date().getFullYear()): number {
  return referenceYear - birthYear;
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function initialsOf(name?: string | null): string {
  if (!name) return 'GX';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
