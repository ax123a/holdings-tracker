import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const standardNumber = new Intl.NumberFormat("en-US");

export function formatShares(n: number | null | undefined): string {
  if (n == null) return "—";
  return standardNumber.format(Math.round(n));
}

export function formatUsd(n: number | null | undefined, compact = true): string {
  if (n == null) return "—";
  const fmt = compact ? compactNumber : standardNumber;
  return `$${fmt.format(n)}`;
}

export function formatPercent(n: number | null | undefined, digits = 2): string {
  if (n == null) return "—";
  return `${n.toFixed(digits)}%`;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
}

export function formatSignedShares(n: number | null | undefined): string {
  if (n == null) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "" : "";
  return `${sign}${standardNumber.format(Math.round(n))}`;
}

export function formatSignedUsd(n: number | null | undefined): string {
  if (n == null) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}$${compactNumber.format(Math.abs(n))}`;
}
