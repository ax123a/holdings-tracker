import type {
  ChangeRow,
  Filing,
  Holder,
  HolderDetail,
  HolderListItem,
  HoldingRow,
  Position,
  Security,
} from "@/lib/types";
import { computeHolderStatus, diffPositions } from "@/lib/diff";
import { mockData } from "./mock-data";
import type { CompanyRow, HoldingsProvider } from "./types";

// In-memory clone so mutations during a long-running dev server don't bleed
// between requests in surprising ways.
const db = {
  holders: [...mockData.holders],
  securities: [...mockData.securities],
  filings: [...mockData.filings],
  positions: [...mockData.positions],
};

const securityById = new Map(db.securities.map((s) => [s.id, s]));

function filingsByHolder(holderId: string): Filing[] {
  return db.filings
    .filter((f) => f.holderId === holderId)
    .sort((a, b) => b.reportPeriod.localeCompare(a.reportPeriod));
}

function positionsByFiling(filingId: string): Position[] {
  return db.positions.filter((p) => p.filingId === filingId);
}

function firstSeenDate(holderId: string, securityId: string): string {
  const periods = db.filings
    .filter((f) => f.holderId === holderId)
    .filter((f) => db.positions.some((p) => p.filingId === f.id && p.securityId === securityId))
    .map((f) => f.reportPeriod)
    .sort();
  return periods[0] ?? "—";
}

export class MockProvider implements HoldingsProvider {
  readonly name = "mock";

  constructor() {
    // Recompute every holder's latestStatus from its actual diff so the seed
    // file doesn't have to maintain them by hand.
    for (const h of db.holders) {
      const fs = filingsByHolder(h.id);
      const [curr, prev] = fs;
      if (!curr) {
        h.latestStatus = "NONE";
        continue;
      }
      const changes = diffPositions({
        holderId: h.id,
        currentFilingId: curr.id,
        previousFilingId: prev?.id ?? null,
        currentPositions: positionsByFiling(curr.id),
        previousPositions: prev ? positionsByFiling(prev.id) : [],
      });
      h.latestStatus = computeHolderStatus(changes);
    }
  }

  async listHolders(query?: { search?: string }): Promise<HolderListItem[]> {
    const q = query?.search?.trim().toLowerCase();
    const rows = db.holders.map((h) => ({
      id: h.id,
      displayCode: h.displayCode,
      displayName: h.displayName,
      latestStatus: h.latestStatus,
    }));
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.displayCode.toLowerCase().includes(q) ||
        r.displayName.toLowerCase().includes(q)
    );
  }

  async getHolder(id: string): Promise<HolderDetail | null> {
    const holder = db.holders.find((h) => h.id === id);
    if (!holder) return null;

    const fs = filingsByHolder(id);
    const latest = fs[0] ?? null;
    if (!latest) {
      return { holder, latestFiling: null, totalHoldings: 0, totalValueUsd: 0 };
    }
    const pos = positionsByFiling(latest.id);
    return {
      holder,
      latestFiling: latest,
      totalHoldings: pos.length,
      totalValueUsd: pos.reduce((acc, p) => acc + p.valueUsd, 0),
    };
  }

  async getHoldings(id: string): Promise<HoldingRow[]> {
    const fs = filingsByHolder(id);
    const latest = fs[0];
    if (!latest) return [];
    const pos = positionsByFiling(latest.id);
    return pos
      .map<HoldingRow>((p) => {
        const sec = securityById.get(p.securityId)!;
        return {
          ticker: sec.ticker,
          issuerName: sec.issuerName,
          cusip: sec.cusip,
          shares: p.shares,
          valueUsd: p.valueUsd,
          portfolioWeight: p.portfolioWeight,
          firstSeen: firstSeenDate(id, p.securityId),
          lastReport: latest.reportPeriod,
          themes: sec.themes,
        };
      })
      .sort((a, b) => b.valueUsd - a.valueUsd);
  }

  async getChanges(id: string): Promise<ChangeRow[]> {
    const fs = filingsByHolder(id);
    const [curr, prev] = fs;
    if (!curr) return [];

    const changes = diffPositions({
      holderId: id,
      currentFilingId: curr.id,
      previousFilingId: prev?.id ?? null,
      currentPositions: positionsByFiling(curr.id),
      previousPositions: prev ? positionsByFiling(prev.id) : [],
    });

    // Surface meaningful activity first: NEW → REMOVED → INCREASED → DECREASED → UNCHANGED.
    const order = { NEW: 0, REMOVED: 1, INCREASED: 2, DECREASED: 3, UNCHANGED: 4 };

    return changes
      .filter((c) => c.changeType !== "UNCHANGED")
      .map<ChangeRow>((c) => {
        const sec = securityById.get(c.securityId)!;
        return {
          ticker: sec.ticker,
          issuerName: sec.issuerName,
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
    return filingsByHolder(id);
  }

  async listCompanies(query?: { theme?: string; search?: string }): Promise<CompanyRow[]> {
    const theme = query?.theme?.trim().toLowerCase();
    const q = query?.search?.trim().toLowerCase();

    // For each security, walk every holder's latest filing and total exposure.
    const latestFilingByHolder = new Map<string, string>();
    for (const h of db.holders) {
      const fs = filingsByHolder(h.id);
      if (fs[0]) latestFilingByHolder.set(h.id, fs[0].id);
    }

    const rows: CompanyRow[] = [];
    for (const sec of db.securities) {
      if (theme && !sec.themes.includes(theme)) continue;
      if (
        q &&
        !(sec.ticker?.toLowerCase().includes(q) ?? false) &&
        !sec.issuerName.toLowerCase().includes(q)
      ) {
        continue;
      }

      const owners: CompanyRow["holders"] = [];
      for (const h of db.holders) {
        const fid = latestFilingByHolder.get(h.id);
        if (!fid) continue;
        const owned = db.positions.filter((p) => p.filingId === fid && p.securityId === sec.id);
        if (owned.length === 0) continue;
        const value = owned.reduce((acc, p) => acc + p.valueUsd, 0);
        owners.push({
          id: h.id,
          displayCode: h.displayCode,
          displayName: h.displayName,
          valueUsd: value,
        });
      }

      rows.push({
        security: sec as Security,
        holderCount: owners.length,
        totalValueUsd: owners.reduce((acc, o) => acc + o.valueUsd, 0),
        holders: owners.sort((a, b) => b.valueUsd - a.valueUsd),
      });
    }

    return rows.sort((a, b) => b.totalValueUsd - a.totalValueUsd);
  }

  async syncHolder(id: string) {
    const holder = db.holders.find((h) => h.id === id);
    if (!holder) return { ok: false as const, error: "Holder not found" };

    // In the mock, "sync" just recomputes latestStatus from existing filings.
    const changes = await this.getChanges(id);
    holder.latestStatus = computeHolderStatus(changes);
    return { ok: true as const, holder };
  }

  async syncAll() {
    let synced = 0;
    let failed = 0;
    for (const h of db.holders) {
      const r = await this.syncHolder(h.id);
      if (r.ok) synced += 1;
      else failed += 1;
    }
    return { synced, failed };
  }
}
