import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompaniesShell } from "@/components/companies-shell";
import type { MatrixRow } from "@/components/theme-matrix";
import { getProvider } from "@/lib/providers";
import { THEME_LIST, themeLabel } from "@/lib/themes";
import { formatUsd } from "@/lib/utils";
import type { CompanyRow } from "@/lib/providers/types";

export const dynamic = "force-dynamic";

type SortKey = "holders" | "value" | "ticker";
type SortDir = "desc" | "asc";

const DEFAULT_LIMIT = 200;
const ALLOWED_LIMITS = [50, 200, 500, 1000];

const CATEGORY_COLUMNS = [
  { key: "Elite Hedge Funds", short: "Hedge" },
  { key: "AI & Technology", short: "AI/Tech" },
  { key: "Mega Asset Managers", short: "Asset" },
  { key: "Public Pension Funds", short: "Pension" },
  { key: "Other", short: "Other" },
];

interface PageProps {
  searchParams: Promise<{ theme?: string; q?: string; sort?: string; dir?: string; limit?: string }>;
}

function parseSort(raw?: string): SortKey {
  if (raw === "holders" || raw === "value" || raw === "ticker") return raw;
  return "holders";
}
function parseDir(raw?: string): SortDir {
  return raw === "asc" ? "asc" : "desc";
}
function parseLimit(raw?: string): number {
  const n = parseInt(raw ?? "", 10);
  return ALLOWED_LIMITS.includes(n) ? n : DEFAULT_LIMIT;
}

function sortRows(rows: CompanyRow[], sort: SortKey, dir: SortDir): CompanyRow[] {
  const mult = dir === "asc" ? 1 : -1;
  const out = rows.slice();
  out.sort((a, b) => {
    let cmp = 0;
    if (sort === "holders") cmp = a.holderCount - b.holderCount;
    else if (sort === "value") cmp = a.totalValueUsd - b.totalValueUsd;
    else cmp = (a.security.ticker ?? "").localeCompare(b.security.ticker ?? "");
    if (cmp !== 0) return cmp * mult;
    return b.totalValueUsd - a.totalValueUsd;
  });
  return out;
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const theme = sp.theme?.trim().toLowerCase();
  const q = sp.q?.trim();
  const sort = parseSort(sp.sort);
  const dir = parseDir(sp.dir);
  const limit = parseLimit(sp.limit);

  const providerInst = getProvider();
  const [rowsUnsorted, allCompanies, holders] = await Promise.all([
    providerInst.listCompanies({ theme, search: q }),
    providerInst.listCompanies(),
    providerInst.listHolders(),
  ]);
  const sorted = sortRows(rowsUnsorted, sort, dir);
  const totalCount = sorted.length;
  const rows = sorted.slice(0, limit);

  const categoryByHolder = new Map<string, string>();
  for (const h of holders) categoryByHolder.set(h.id, h.category ?? "Other");

  const matrixBySlug = new Map<string, MatrixRow>();
  for (const c of allCompanies) {
    if (c.security.themes.length === 0) continue;
    for (const owner of c.holders) {
      const cat = categoryByHolder.get(owner.id) ?? "Other";
      for (const t of c.security.themes) {
        let row = matrixBySlug.get(t);
        if (!row) {
          row = { slug: t, label: themeLabel(t), total: 0, byCat: {} };
          matrixBySlug.set(t, row);
        }
        row.byCat[cat] = (row.byCat[cat] ?? 0) + owner.valueUsd;
        row.total += owner.valueUsd;
      }
    }
  }
  const matrixRows = Array.from(matrixBySlug.values()).sort(
    (a, b) => b.total - a.total,
  );
  const visibleCategories = CATEGORY_COLUMNS.filter((c) =>
    matrixRows.some((r) => (r.byCat[c.key] ?? 0) > 0),
  );

  const provider = (process.env.DATA_PROVIDER ?? "mock").toLowerCase();
  const isLive = provider === "sec13f";

  const header = (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h1 className="text-sm font-semibold">
          {isLive ? "Companies held by tracked institutional filers" : "Tracked companies"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {isLive
            ? "Aggregated from each holder's latest available 13F filing. Delayed; not real-time."
            : "Securities held across the demo filer set, grouped by ownership."}
        </p>
      </div>
      <span className="text-[11px] text-muted-foreground num">
        {rows.length} of {totalCount.toLocaleString()} companies
      </span>
    </div>
  );

  const pills = (
    <>
      <ThemeChip slug="" label="All" active={!theme} q={q} sort={sort} dir={dir} limit={limit} />
      {THEME_LIST.map((t) => (
        <ThemeChip
          key={t.slug}
          slug={t.slug}
          label={t.label}
          active={theme === t.slug}
          q={q}
          sort={sort}
          dir={dir}
          limit={limit}
        />
      ))}
      <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
        Show top
        {ALLOWED_LIMITS.map((n) => (
          <LimitChip
            key={n}
            n={n}
            active={limit === n}
            theme={theme}
            q={q}
            sort={sort}
            dir={dir}
          />
        ))}
      </span>
    </>
  );

  const table = (
    <>
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">
                <SortHeader label="Ticker" col="ticker" sort={sort} dir={dir} theme={theme} q={q} limit={limit} />
              </TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Themes</TableHead>
              <TableHead className="text-right">
                <SortHeader label="Holders" col="holders" sort={sort} dir={dir} theme={theme} q={q} limit={limit} align="right" />
              </TableHead>
              <TableHead className="text-right">
                <SortHeader label={isLive ? "Total reported value" : "Total demo value"} col="value" sort={sort} dir={dir} theme={theme} q={q} limit={limit} align="right" />
              </TableHead>
              <TableHead>Held by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                  No companies match this filter.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.security.id}>
                  <TableCell className="font-mono text-xs">
                    {r.security.ticker ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate" title={r.security.cusip}>
                    {r.security.issuerName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.security.themes.map((t) => (
                        <Badge key={t} tone="neutral">{themeLabel(t)}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="num text-right">{r.holderCount}</TableCell>
                  <TableCell className="num text-right">{formatUsd(r.totalValueUsd)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
                      {r.holders.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        r.holders.map((h) => (
                          <Link
                            key={h.id}
                            href={`/holders/${h.id}`}
                            className="font-mono text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                            title={h.displayName}
                          >
                            {h.displayCode}
                          </Link>
                        ))
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalCount > rows.length ? (
        <p className="text-[11px] text-muted-foreground">
          Showing top {rows.length.toLocaleString()} of {totalCount.toLocaleString()} —
          increase the limit above or sort/search to narrow further.
        </p>
      ) : null}
    </>
  );

  return (
    <CompaniesShell
      header={header}
      pills={pills}
      table={table}
      matrixRows={matrixRows}
      matrixCategories={visibleCategories}
    />
  );
}

function buildHref(params: { theme?: string; q?: string; sort?: SortKey; dir?: SortDir; limit?: number }) {
  const p = new URLSearchParams();
  if (params.theme) p.set("theme", params.theme);
  if (params.q) p.set("q", params.q);
  if (params.sort) p.set("sort", params.sort);
  if (params.dir) p.set("dir", params.dir);
  if (params.limit && params.limit !== DEFAULT_LIMIT) p.set("limit", String(params.limit));
  const qs = p.toString();
  return `/companies${qs ? `?${qs}` : ""}`;
}

function ThemeChip({
  slug, label, active, q, sort, dir, limit,
}: {
  slug: string; label: string; active: boolean;
  q?: string; sort: SortKey; dir: SortDir; limit: number;
}) {
  const href = buildHref({ theme: slug || undefined, q, sort, dir, limit });
  return (
    <Link
      href={href}
      className={
        "rounded-sm border px-2 py-0.5 text-[11px] font-medium leading-none transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground")
      }
    >
      {label}
    </Link>
  );
}

function LimitChip({
  n, active, theme, q, sort, dir,
}: {
  n: number; active: boolean;
  theme?: string; q?: string; sort: SortKey; dir: SortDir;
}) {
  const href = buildHref({ theme, q, sort, dir, limit: n });
  return (
    <Link
      href={href}
      className={
        "rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-none transition-colors " +
        (active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground")
      }
    >
      {n}
    </Link>
  );
}

function SortHeader({
  label, col, sort, dir, theme, q, limit, align,
}: {
  label: string; col: SortKey; sort: SortKey; dir: SortDir;
  theme?: string; q?: string; limit: number;
  align?: "right" | "left";
}) {
  const active = sort === col;
  const nextDir: SortDir = active && dir === "desc" ? "asc" : "desc";
  const href = buildHref({ theme, q, sort: col, dir: nextDir, limit });
  const arrow = active ? (dir === "desc" ? " ▼" : " ▲") : "";
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-1 hover:text-foreground " +
        (active ? "text-foreground font-semibold" : "") +
        (align === "right" ? " justify-end" : "")
      }
    >
      {label}
      <span className="text-[10px]">{arrow}</span>
    </Link>
  );
}
