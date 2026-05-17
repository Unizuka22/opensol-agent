export function formatLamportsAsSol(lamports: number): number {
  return lamports / 1_000_000_000;
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "unknown";
  }

  const numericValue = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 9
  }).format(numericValue);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "unknown";
  }

  return `${value.toFixed(2)}%`;
}

export function shortAddress(address: string, edge = 4): string {
  if (address.length <= edge * 2 + 3) {
    return address;
  }

  return `${address.slice(0, edge)}...${address.slice(-edge)}`;
}

export function boolStatus(value: string | null | undefined): "active" | "disabled" | "unknown" {
  if (value === undefined) {
    return "unknown";
  }

  return value === null ? "disabled" : "active";
}
