export function yearToPercent(year: number, viewStart: number, viewEnd: number): number {
  return ((year - viewStart) / (viewEnd - viewStart)) * 100;
}

export function percentToYear(percent: number, viewStart: number, viewEnd: number): number {
  return viewStart + (percent / 100) * (viewEnd - viewStart);
}

export function formatYear(year: number, t: (key: string) => string): string {
  const rounded = Math.round(year);
  if (rounded < 0) return `${Math.abs(rounded)} ${t('common.bce')}`;
  return `${rounded} ${t('common.ce')}`;
}

/** Picks a "nice" tick interval (in years) for the ruler given the visible span. */
export function pickTickInterval(spanYears: number): number {
  const targetTicks = 10;
  const rough = spanYears / targetTicks;
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
  return steps.find((s) => s >= rough) ?? steps[steps.length - 1];
}
