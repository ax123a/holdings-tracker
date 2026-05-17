import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusLabel } from "@/lib/diff";
import { getProvider } from "@/lib/providers";
import { themeLabel } from "@/lib/themes";
import type { ChangeType } from "@/lib/types";
import {
  formatDate,
  formatPercent,
  formatShares,
  formatSignedShares,
  formatSignedUsd,
  formatUsd,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

function changeTone(t: ChangeType) {
  switch (t) {
    case "NEW":
      return "added" as const;
    case "REMOVED":
      return "removed" as const;
    case "INCREASED":
      return "increased" as const;
    case "DECREASED":
      return "decreased" as const;
    default:
      return "neutral" as const;
  }
}

function changeLabel(t: ChangeType) {
  switch (t) {
    case "NEW": return "New";
    case "REMOVED": return "Removed";
    case "INCREASED": return "Increased";
    case "DECREASED": return "Decreased";
    default: return "Unchanged";
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = getProvider();

  const [detail, holdings, changes, filings] = await Promise.all([
    provider.getHolder(id),
    provider.getHoldings(id),
    provider.getChanges(id),
    provider.getFilings(id),
  ]);

  if (!detail) notFound();

  const { holder, latestFiling, totalHoldings, totalValueUsd } = detail;
  const hasData = !!latestFiling;

  type ThemeAgg = { count: number; valueUsd: number };
  const themeAgg = new Map<string, ThemeAgg>();
  for (const h of holdings) {
    for (const t of h.themes) {
      const cur = themeAgg.get(t) ?? { count: 0, valueUsd: 0 };
      cur.count += 1;
      cur.valueUsd += h.valueUsd;
      themeAgg.set(t, cur);
    }
  }
  const themePills = Array.from(themeAgg.entries())
    .map(([slug, agg]) => ({
      slug,
      label: themeLabel(slug),
      count: agg.count,
      pct: totalValueUsd > 0 ? (agg.valueUsd / totalValueUsd) * 100 : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">← All holders</Link>
        <span className="num">{holder.cik ? `CIK ${holder.cik}` : "no CIK"}</span>
      </div>

      <div className="border-b border-border pb-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-mono text-lg font-semibold">{holder.displayCode}</h1>
          <span className="text-sm text-muted-foreground">{holder.legalName}</span>
          {holder.latestStatus !== "NONE" && (
            <Badge
              tone={
                holder.latestStatus === "ADDED"
                  ? "added"
                  : holder.latestStatus === "REMOVED"
                  ? "removed"
                  : "mixed"
              }
            >
              {statusLabel(holder.latestStatus)}
            </Badge>
          )}
        </div>
        {hasData ? (
          <>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Report period</dt>
                <dd className="num">{formatDate(holder.latestReportPeriod)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Filed</dt>
                <dd className="num">{formatDate(holder.latestFilingDate)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Holdings</dt>
                <dd className="num">{totalHoldings}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Portfolio value</dt>
                <dd className="num">{formatUsd(totalValueUsd)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              13F filings are <span className="font-medium">quarterly and reported with a ~45-day lag</span>;
              "Report period" is the as-of date of the holdings snapshot, not today's positions.
              Trade-level buy dates are not disclosed — "First seen" shows the earliest report period this position appears in.
            </p>
          </>
        ) : null}
      </div>

      {!hasData ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
          <p className="text-sm font-medium">No filings available yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This entity is tracked, but no 13F filings have been ingested.
          </p>
          <form
            action={`/api/holders/${holder.id}/sync`}
            method="post"
            className="mt-4 inline-block"
          >
            <Button type="submit" size="sm" variant="outline">
              Try syncing now
            </Button>
          </form>
        </div>
      ) : (
        <Tabs defaultValue="holdings">
          <TabsList>
            <TabsTrigger value="holdings">Current Holdings</TabsTrigger>
            <TabsTrigger value="changes">Recent Changes</TabsTrigger>
            <TabsTrigger value="filings">Filing History</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings">
            {themePills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {themePills.map((t) => (
                  <span
                    key={t.slug}
                    className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-medium leading-none"
                  >
                    <span>{t.label}</span>
                    <span className="ml-2 border-l border-border pl-2 text-muted-foreground num">
                      {t.count}
                    </span>
                    <span className="ml-2 border-l border-border pl-2 text-muted-foreground num">
                      {t.pct.toFixed(0)}%
                    </span>
                  </span>
                ))}
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
                  {holdings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                        No holdings in the latest filing.
                      </TableCell>
                    </TableRow>
                  ) : (
                    holdings.map((h, i) => (
                      <TableRow key={`${h.cusip}-${h.ticker ?? "x"}-${i}`}>
                        <TableCell className="font-mono text-xs">
                          {h.ticker ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate">{h.issuerName}</TableCell>
                        <TableCell className="num text-right">{formatShares(h.shares)}</TableCell>
                        <TableCell className="num text-right">{formatUsd(h.valueUsd)}</TableCell>
                        <TableCell className="num text-right">
                          {formatPercent(h.portfolioWeight)}
                        </TableCell>
                        <TableCell className="num text-right">{formatDate(h.firstSeen)}</TableCell>
                        <TableCell className="num text-right">{formatDate(h.lastReport)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="changes">
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Ticker</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead className="text-right">Prev shares</TableHead>
                    <TableHead className="text-right">Curr shares</TableHead>
                    <TableHead className="text-right">Δ shares</TableHead>
                    <TableHead className="text-right">Δ value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                        No changes vs. previous filing.
                      </TableCell>
                    </TableRow>
                  ) : (
                    changes.map((c, i) => (
                      <TableRow key={`${c.ticker ?? "x"}-${i}`}>
                        <TableCell className="font-mono text-xs">
                          {c.ticker ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="max-w-[260px] truncate">{c.issuerName}</TableCell>
                        <TableCell>
                          <Badge tone={changeTone(c.changeType)}>{changeLabel(c.changeType)}</Badge>
                        </TableCell>
                        <TableCell className="num text-right">{formatShares(c.previousShares)}</TableCell>
                        <TableCell className="num text-right">{formatShares(c.currentShares)}</TableCell>
                        <TableCell className="num text-right">
                          {formatSignedShares(c.sharesDelta)}
                        </TableCell>
                        <TableCell className="num text-right">
                          {formatSignedUsd(c.valueDeltaUsd)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="filings">
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report period</TableHead>
                    <TableHead>Filed</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Accession</TableHead>
                    <TableHead className="text-right">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filings.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="num">{formatDate(f.reportPeriod)}</TableCell>
                      <TableCell className="num">{formatDate(f.filedAt)}</TableCell>
                      <TableCell className="text-xs">
                        {f.filingType.replace("THIRTEEN_F_", "13F-")}
                        {f.isAmendment ? " (Amend.)" : ""}
                      </TableCell>
                      <TableCell className="num text-xs">{f.accessionNumber}</TableCell>
                      <TableCell className="text-right">
                        {f.sourceUrl ? (
                          <a
                            href={f.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            EDGAR →
                          </a>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
