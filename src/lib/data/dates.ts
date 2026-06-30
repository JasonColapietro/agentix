/** Date helpers shared by the seed generator and the manual-input store. */
export const MS_DAY = 86_400_000;

/** How many days of history the charts span. */
export const WINDOW_DAYS = 90;

/** UTC YYYY-MM-DD for a Date. */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_DAY);
}

/** The window of day-keys the charts span, oldest → newest (length `days`). */
export function windowKeys(now: Date, days = WINDOW_DAYS): string[] {
  const end = startOfUtcDay(now);
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) out.push(dayKey(new Date(end.getTime() - i * MS_DAY)));
  return out;
}
