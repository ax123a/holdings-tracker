"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HoldingRow } from "@/lib/types";
import {
  cn,
  formatDate,
  formatPercent,
  formatShares,
  formatUsd,
} from "@/lib/utils";

export type ThemePill = {
  slug: string;
  label: string;
  count: number;
  pct: number;
};

const PILL_BASE =
  "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium leading-none cursor-pointer transition-colors";
const PILL_INACTIVE = "border-border bg-muted hover:bg-accent";
const PILL_ACTIVE = "border-primary bg-primary text-primary-foreground";

export function HolderHoldingsTab({
  holdings,
  themePills,
}: {
  holdings: HoldingRow[];
  themePills: ThemePill[];
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      selectedSlug
        ? holdings.filter((h) => h.themes.includes(selectedSlug))
        : holdings,
    [holdings, selectedSlug],
  );

  const toggle = (slug: string) =>
    setSelectedSlug((cur) => (cur === slug ? null : slug));

  return (
    <>
      {themePills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectedSlug(null)}
            className={cn(
              PILL_BASE,
              selectedSlug === null ? PILL_ACTIVE : PILL_INACTIVE,
            )}
          >
            <span>All</span>
            <span
              className={cn(
                "ml-2 border-l pl-2 num",
                selectedSlug === null
                  ? "border-primary-foreground/30 opacity-90"
                  : "border-border text-muted-foreground",
              )}
            >
              {holdings.length}
            </span>
          </button>
          {themePills.map((t) => {
            const active = selectedSlug === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => toggle(t.slug)}
                className={cn(PILL_BASE, active ? PILL_ACTIVE : PILL_INACTIVE)}
              >
                <span>{t.label}</span>
                <span
                  className={cn(
                    "ml-2 border-l pl-2 num",
                    active
                      ? "border-primary-foreground/30 opacity-90"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {t.count}
                </span>
                <span
                  className={cn(
                    "ml-2 border-l pl-2 num",
                    active
                      ? "border-primary-foreground/30 opacity-90"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {t.pct.toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">Ticker</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Market value</TableHead>
              <TableHead className="text-right">Portfolio %</TableHead>
              <TableHead className="text-right">First seen</TableHead>
              <TableHead className="text-right">Last report</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  {selectedSlug
                    ? "No holdings in this category."
                    : "No holdings in the latest filing."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((h, i) => (
                <TableRow key={`${h.cusip}-${h.ticker ?? "x"}-${i}`}>
                  <TableCell className="font-mono text-xs">
                    {h.ticker ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate">
                    {h.issuerName}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatShares(h.shares)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatUsd(h.valueUsd)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatPercent(h.portfolioWeight)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatDate(h.firstSeen)}
                  </TableCell>
                  <TableCell className="num text-right">
                    {formatDate(h.lastReport)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
