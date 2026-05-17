"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { statusLabel } from "@/lib/diff";
import type { HolderListItem, HolderStatus } from "@/lib/types";
import { cn, formatQuarter } from "@/lib/utils";

const CATEGORY_ORDER = [
  "Elite Hedge Funds",
  "AI & Technology",
  "Mega Asset Managers",
  "Public Pension Funds",
  "Other",
];

function statusColor(s: HolderStatus): string {
  switch (s) {
    case "ADDED":
      return "text-success";
    case "REMOVED":
      return "text-destructive";
    case "ADDED_AND_REMOVED":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
}

export type ThemeExposureStock = { ticker: string | null; issuerName: string };
export type ThemeExposure = {
  slug: string;
  label: string;
  count: number;
  stocks: ThemeExposureStock[];
};

export function HolderList({
  holders,
  exposureByCategory,
}: {
  holders: HolderListItem[];
  exposureByCategory?: Record<string, ThemeExposure[]>;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<{
    category: string;
    label: string;
    stocks: ThemeExposureStock[];
  } | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return holders;
    return holders.filter(
      (h) =>
        h.displayCode.toLowerCase().includes(needle) ||
        h.displayName.toLowerCase().includes(needle)
    );
  }, [holders, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, HolderListItem[]>();
    for (const h of filtered) {
      const cat = h.category ?? "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(h);
    }
    return CATEGORY_ORDER
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: map.get(cat)! }));
  }, [filtered]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          type="search"
          placeholder="Filter by code or name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-8 max-w-sm text-sm"
        />
        <span className="text-xs text-muted-foreground num">
          {filtered.length}/{holders.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
          No holders match that filter.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, items }) => (
            <section key={category}>
              <h2 className="text-lg font-bold tracking-tight mb-3 mt-6 first:mt-0">
                {category}
              </h2>
              {exposureByCategory?.[category]?.length ? (
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  {exposureByCategory[category].map((e) => (
                    <button
                      key={e.slug}
                      type="button"
                      onClick={() => {
                        setSelected({ category, label: e.label, stocks: e.stocks });
                        setVisibleCount(10);
                      }}
                      className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-medium leading-none cursor-pointer hover:bg-accent transition-colors"
                    >
                      <span>{e.label}</span>
                      <span className="ml-2 border-l border-border pl-2 text-muted-foreground num">
                        {e.count}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="overflow-hidden rounded-md border border-border bg-card">
                <div className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,1.5fr)_auto] border-b border-border bg-muted/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Name</span>
                  <span>Manager / Signatory</span>
                  <span className="pl-6 text-right">Status</span>
                </div>
                <ul className="row-divider">
                  {items.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/holders/${h.id}`)}
                        className="grid w-full grid-cols-[minmax(120px,1fr)_minmax(160px,1.5fr)_auto] items-center gap-3 px-3 py-1.5 text-left transition-colors hover:bg-accent/60 focus:bg-accent/60 focus:outline-none"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-mono text-[13px] font-semibold leading-tight">
                            {h.displayCode}
                          </span>
                          <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                            {h.displayName}
                          </span>
                        </span>
                        <span className="min-w-0">
                          {h.managerName ? (
                            <>
                              <span className="block truncate text-[12px] leading-tight">
                                {h.managerName}
                              </span>
                              <span className="block truncate text-[11px] leading-tight text-muted-foreground">
                                {h.managerTitle ?? ""}
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/50">N/A</span>
                          )}
                        </span>
                        <span
                          className={cn(
                            "pl-6 text-right text-[12px] leading-tight",
                            statusColor(h.latestStatus)
                          )}
                        >
                          {statusLabel(h.latestStatus) ||
                            formatQuarter(h.latestReportPeriod) || (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}

      {selected ? (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-background border rounded-lg max-w-md w-full p-6 shadow-lg relative max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
            <div className="mb-3 pr-6">
              <h3 className="text-sm font-semibold leading-tight">{selected.label}</h3>
              <p className="text-[11px] text-muted-foreground">
                {selected.category} · {selected.stocks.length} stock
                {selected.stocks.length === 1 ? "" : "s"}
              </p>
            </div>
            <ul className="flex-1 overflow-y-auto row-divider text-sm">
              {selected.stocks.slice(0, visibleCount).map((s, i) => (
                <li key={`${s.ticker ?? s.issuerName}-${i}`} className="flex items-baseline gap-3 py-1.5">
                  <span className="font-mono text-[12px] font-semibold w-16 shrink-0">
                    {s.ticker ?? <span className="text-muted-foreground">—</span>}
                  </span>
                  <span className="text-[12px] text-muted-foreground truncate">
                    {s.issuerName}
                  </span>
                </li>
              ))}
            </ul>
            {selected.stocks.length > visibleCount ? (
              <button
                type="button"
                onClick={() => setVisibleCount((p) => p + 10)}
                className="mt-3 self-center rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium hover:bg-accent transition-colors"
              >
                …
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
