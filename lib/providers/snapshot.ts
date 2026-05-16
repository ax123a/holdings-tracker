// Snapshot provider — reads data/snapshot.json (committed at build time).
//
// Used in production on Vercel: no SQLite at runtime. Generate locally with
// `npm run snapshot` after `npm run sync -- --all`, then commit the JSON.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { diffPositions } from "@/lib/diff";
import { CIK_CATEGORY_MAP } from "@/lib/sec/seed-holders";
import { themesForCusip } from "@/lib/sec/cusip-map";
import type {
  ChangeRow,
  ChangeType,
  Filing,
  Holder,
  HolderDetail,
  HolderListItem,
  HoldingRow,
  Position,
} from "@/lib/types";
import type { CompanyRow, HoldingsProvider } from "./types";

type RawHolder = {
  id: string; displayCode: string; displayName: string; legalName: string;
  cik: string | null; sourceType: string; latestStatus: string;
  latestReportPeriod: string | null; latestFilingDate: string | null;
  managerName: string | null; managerTitle: string | null; tracked: boolean;
};
type RawFiling = {
  id: string; holderId: string; accessionNumber: string; filingType: string;
  reportPeriod: string; filedAt: string; sourceUrl: string | null; isAmendment: boolean;
};
type RawSecurity = {
  id: string; cusip: string; ticker: string | null; issuerName: string;
  exchange: string | null; country: string | null;
};
type RawPosition = {
  id: string; filingId: string; securityId: string; shares: number; valueUsd: number;
  classTitle: string | null; putCall: string | null; portfolioWeight: number | null;
};
type Snapshot = {
  generatedAt: string;
  holders: RawHolder[];
  filings: RawFiling[];
  securities: RawSecurity[];
  positions: RawPosition[];
};

let cached: {
  snap: Snapshot;
  filingsByHolder: Map<string, RawFiling[]>;
  positionsByFiling: Map<string, RawPosition[]>;
  securityById: Map<string, RawSecurity>;
  holderById: Map<string, RawHolder>;
} | null = null;

function load() {
  if (cached) return cached;
  const path = join(process.cwd(), "data", "snapshot.json");
  const snap = JSON.parse(readFileSync(path, "utf8")) as Snapshot;

  const filingsByHolder = new Map<string, RawFiling[]>();
  for (const f of snap.filings) {
    const arr = filingsByHolder.get(f.holderId) ?? [];
    arr.push(f);
    filingsByHolder.set(f.holderId, arr);
  }
  for (const arr of filingsByHolder.values()) {
    arr.sort((a, b) => b.reportPeriod.localeCompare(a.reportPeriod));
  }

  const positionsByFiling = new Map<string, RawPosition[]>();
  for (const p of snap.positions) {
    const arr = positionsByFiling.get(p.filingId) ?? [];
    arr.push(p);
    positionsByFiling.set(p.filingId, arr);
  }

  cached = {
    snap,
    filingsByHolder,
    positionsByFiling,
    securityById: new Map(snap.securities.map((s) => [s.id, s])),
    holderById: new Map(snap.holders.map((h) => [h.id, h])),
  };
  return cached;
}

function isoDate(s: string | null): string | null {
  return s ? s.slice(0, 10) : null;
}

function toHolder(h: RawHolder): Holder {
  return {
    id: h.id,
    displayCode: h.displayCode,
    displayName: h.displayName,
    legalName: h.legalName,
    cik: h.cik,
    sourceType: h.sourceType as Holder["sourceType"],
    latestStatus: h.latestStatus as Holder["latestStatus"],
    latestReportPeriod: isoDate(h.latestReportPeriod),
    latestFilingDate: isoDate(h.latestFilingDate),
    tracked: h.tracked,
  };
}

function toFiling(f: RawFiling): Filing {
  return {
    id: f.id,
    holderId: f.holderId,
    accessionNumber: f.accessionNumber,
    filingType: f.filingType as Filing["filingType"],
    reportPeriod: f.reportPeriod.slice(0, 10),
    filedAt: f.filedAt.slice(0, 10),
    sourceUrl: f.sourceUrl,
    isAmendment: f.isAmendment,
  };
}

function toDomainPosition(p: RawPosition): Position {
  return p;
}

export class SnapshotProvider implements HoldingsProvider {
  readonly name = "snapshot";

  async listHolders(query?: { search?: string }): Promise<HolderListItem[]> {
    const { snap } = load();
    const q = query?.search?.trim().toLowerCase();
    const list: HolderListItem[] = snap.holders
      .filter((h) => h.tracked)
      .sort((a, b) => a.displayCode.localeCompare(b.displayCode))
      .map((h) => ({
        id: h.id,
        displayCode: h.displayCode,
        displayName: h.displayName,
        latestStatus: h.latestStatus as HolderListItem["latestStatus"],
        category: (h.cik ? CIK_CATEGORY_MAP.get(h.cik) : undefined) ?? "Other",
        managerName: h.managerName,
        managerTitle: h.managerTitle,
      }));
    if (!q) return list;
    return list.filter(
      (r) =>
        r.displayCode.toLowerCase().includes(q) ||
        r.displayName.toLowerCase().includes(q),
    );
  }

  async getHolder(id: string): Promise<HolderDetail | null> {
    const { holderById, filingsByHolder, positionsByFiling } = load();
    const holder = holderById.get(id);
    if (!holder) return null;
    const fs = filingsByHolder.get(id) ?? [];
    const latest = fs[0];
    if (!latest) {
      return { holder: toHolder(holder), latestFiling: null, totalHoldings: 0, totalValueUsd: 0 };
    }
    const positions = positionsByFiling.get(latest.id) ?? [];
    return {
      holder: toHolder(holder),
      latestFiling: toFiling(latest),
      totalHoldings: positions.length,
      totalValueUsd: positions.reduce((acc, p) => acc + p.valueUsd, 0),
    };
  }

  async getHoldings(id: string): Promise<HoldingRow[]> {
    const { filingsByHolder, positionsByFiling, securityById } = load();
    const fs = filingsByHolder.get(id) ?? [];
    const latest = fs[0];
    if (!latest) return [];
    const positions = positionsByFiling.get(latest.id) ?? [];

    const firstSeen = new Map<string, string>();
    const ordered = fs.slice().sort((a, b) => a.reportPeriod.localeCompare(b.reportPeriod));
    for (const f of ordered) {
      const period = f.reportPeriod.slice(0, 10);
      for (const p of positionsByFiling.get(f.id) ?? []) {
        if (!firstSeen.has(p.securityId)) firstSeen.set(p.securityId, period);
      }
    }

    return positions
      .map<HoldingRow>((p) => {
        const sec = securityById.get(p.securityId)!;
        return {
          ticker: sec.ticker,
          issuerName: sec.issuerName,
          cusip: sec.cusip,
          shares: p.shares,
          valueUsd: p.valueUsd,
          portfolioWeight: p.portfolioWeight,
          firstSeen: firstSeen.get(p.securityId) ?? "—",
          lastReport: latest.reportPeriod.slice(0, 10),
          themes: themesForCusip(sec.cusip),
        };
      })
      .sort((a, b) => b.valueUsd - a.valueUsd);
  }

  async getChanges(id: string): Promise<ChangeRow[]> {
    const { filingsByHolder, positionsByFiling, securityById } = load();
    const fs = filingsByHolder.get(id) ?? [];
    if (fs.length === 0) return [];
    const [curr, prev] = fs;
    const currPos = positionsByFiling.get(curr.id) ?? [];
    const prevPos = prev ? positionsByFiling.get(prev.id) ?? [] : [];

    const changes = diffPositions({
      holderId: id,
      currentFilingId: curr.id,
      previousFilingId: prev?.id ?? null,
      currentPositions: currPos.map(toDomainPosition),
      previousPositions: prevPos.map(toDomainPosition),
    });

    const order: Record<ChangeType, number> = { NEW: 0, REMOVED: 1, INCREASED: 2, DECREASED: 3, UNCHANGED: 4 };
    return changes
      .filter((c) => c.changeType !== "UNCHANGED")
      .map<ChangeRow>((c) => {
        const sec = securityById.get(c.securityId);
        return {
          ticker: sec?.ticker ?? null,
          issuerName: sec?.issuerName ?? "(unknown)",
          changeType: c.changeType,
          previousShares: c.previousShares,
          currentShares: c.currentShares,
          sharesDelta: c.sharesDelta,
          previousValueUsd: c.previousValueUsd,
          currentValueUsd: c.currentValueUsd,
          valueDeltaUsd: c.valueDeltaUsd,
        };
      })
      .sort((a, b) => {
        const bucket = order[a.changeType] - order[b.changeType];
        if (bucket !== 0) return bucket;
        return Math.abs(b.valueDeltaUsd ?? 0) - Math.abs(a.valueDeltaUsd ?? 0);
      });
  }

  async getFilings(id: string): Promise<Filing[]> {
    const { filingsByHolder } = load();
    return (filingsByHolder.get(id) ?? []).map(toFiling);
  }

  async listCompanies(query?: { theme?: string; search?: string }): Promise<CompanyRow[]> {
    const { snap, holderById, filingsByHolder, positionsByFiling, securityById } = load();
    const q = query?.search?.trim().toLowerCase();
    const theme = query?.theme?.trim().toLowerCase();

    const trackedHolders = snap.holders.filter((h) => h.tracked);
    if (trackedHolders.length === 0) return [];

    const latestFilingIds: { holderId: string; filingId: string }[] = [];
    for (const h of trackedHolders) {
      const fs = filingsByHolder.get(h.id);
      if (fs && fs[0]) latestFilingIds.push({ holderId: h.id, filingId: fs[0].id });
    }

    type SecLite = { id: string; ticker: string | null; issuerName: string; cusip: string; exchange: string | null; country: string | null };
    const agg = new Map<string, { security: SecLite; owners: Map<string, number> }>();
    for (const { holderId, filingId } of latestFilingIds) {
      for (const p of positionsByFiling.get(filingId) ?? []) {
        const sec = securityById.get(p.securityId);
        if (!sec) continue;
        let row = agg.get(p.securityId);
        if (!row) {
          row = { security: sec, owners: new Map() };
          agg.set(p.securityId, row);
        }
        row.owners.set(holderId, (row.owners.get(holderId) ?? 0) + p.valueUsd);
      }
    }

    const out: CompanyRow[] = [];
    for (const row of agg.values()) {
      if (
        q &&
        !(row.security.ticker?.toLowerCase().includes(q) ?? false) &&
        !row.security.issuerName.toLowerCase().includes(q)
      ) {
        continue;
      }
      const themes = themesForCusip(row.security.cusip);
      if (theme && !themes.includes(theme)) continue;

      const owners = Array.from(row.owners.entries())
        .map(([hid, val]) => {
          const h = holderById.get(hid);
          return h
            ? { id: h.id, displayCode: h.displayCode, displayName: h.displayName, valueUsd: val }
            : null;
        })
        .filter((x): x is NonNullable<typeof x> => !!x)
        .sort((a, b) => b.valueUsd - a.valueUsd);

      out.push({
        security: { ...row.security, themes },
        holderCount: owners.length,
        totalValueUsd: owners.reduce((acc, o) => acc + o.valueUsd, 0),
        holders: owners,
      });
    }

    return out.sort((a, b) => b.totalValueUsd - a.totalValueUsd);
  }

  async syncHolder() {
    return { ok: false as const, error: "Snapshot is read-only. Run `npm run sync && npm run snapshot` locally and redeploy." };
  }

  async syncAll() {
    return { synced: 0, failed: 0 };
  }
}
