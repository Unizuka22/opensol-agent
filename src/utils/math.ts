export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return sum(values) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const average = mean(values);
  const variance = mean(values.map((value) => (value - average) ** 2));
  return Math.sqrt(variance);
}

export function percentage(part: number, whole: number): number {
  if (whole <= 0) {
    return 0;
  }

  return (part / whole) * 100;
}
