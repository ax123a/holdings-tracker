// Real SEC 13F provider — reads from Prisma; writes via syncCik()/syncAllSeeded().
//
// Phase 2 contract: implements the same HoldingsProvider surface as
// MockProvider so the UI doesn't change. Holdings show issuer name + CUSIP
// even when ticker is null (best-effort mapping; see lib/sec/cusip-map.ts).

import { prisma } from "@/lib/db";
import { computeHolderStatus, diffPositions } from "@/lib/diff";
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
import { syncAllSeeded, syncCik } from "@/lib/sec/sync";
import { CIK_CATEGORY_MAP } from "@/lib/sec/seed-holders";
import { themesForCusip } from "@/lib/sec/cusip-map";
import type { CompanyRow, HoldingsProvider } from "./types";

function holderRow(h: {
  id: string;
  displayCode: string;
  displayName: string;
  legalName: string;
  cik: string | null;
  sourceType: string;
  latestStatus: string;
  latestReportPeriod: Date | null;
  latestFilingDate: Date | null;
  tracked: boolean;
}): Holder {
  return {
    id: h.id,
    displayCode: h.displayCode,
    displayName: h.displayName,
    legalName: h.legalName,
    cik: h.cik,
    sourceType: h.sourceType as Holder["sourceType"],
    latestStatus: h.latestStatus as Holder["latestStatus"],
    latestReportPeriod: h.latestReportPeriod ? h.latestReportPeriod.toISOString().slice(0, 10) : null,
    latestFilingDate: h.latestFilingDate ? h.latestFilingDate.toISOString().slice(0, 10) : null,
    tracked: h.tracked,
  };
}

function toFiling(f: {
  id: string;
  holderId: string;
  accessionNumber: string;
  filingType: string;
  reportPeriod: Date;
  filedAt: Date;
  sourceUrl: string | null;
  isAmendment: boolean;
}): Filing {
  return {
    id: f.id,
    holderId: f.holderId,
    accessionNumber: f.accessionNumber,
    filingType: f.filingType as Filing["filingType"],
    reportPeriod: f.reportPeriod.toISOString().slice(0, 10),
    filedAt: f.filedAt.toISOString().slice(0, 10),
    sourceUrl: f.sourceUrl,
    isAmendment: f.isAmendment,
  };
}

function toDomainPosition(p: {
  id: string;
  filingId: string;
  securityId: string;
  shares: number;
  valueUsd: number;
  classTitle: string | null;
  putCall: string | null;
  portfolioWeight: number | null;
}): Position {
  return p;
}

export class Sec13FProvider implements HoldingsProvider {
  readonly name = "sec13f";

  async listHolders(query?: { search?: string }): Promise<HolderListItem[]> {
    const q = query?.search?.trim().toLowerCase();
    const rows = await prisma.holder.findMany({
      where: { tracked: true },
      orderBy: { displayCode: "asc" },
      select: { id: true, displayCode: true, displayName: true, latestStatus: true, latestReportPeriod: true, cik: true, managerName: true, managerTitle: true },
    });
    const list = rows.map((h) => ({
      id: h.id,
      displayCode: h.displayCode,
      displayName: h.displayName,
      latestStatus: h.latestStatus as HolderListItem["latestStatus"],
      latestReportPeriod: h.latestReportPeriod ? h.latestReportPeriod.toISOString().slice(0, 10) : null,
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
    const holder = await prisma.holder.findUnique({ where: { id } });
    if (!holder) return null;
    const latest = await prisma.filing.findFirst({
      where: { holderId: id },
      orderBy: { reportPeriod: "desc" },
    });
    if (!latest) {
      return { holder: holderRow(holder), latestFiling: null, totalHoldings: 0, totalValueUsd: 0 };
    }
    const positions = await prisma.position.findMany({ where: { filingId: latest.id } });
    return {
      holder: holderRow(holder),
      latestFiling: toFiling(latest),
      totalHoldings: positions.length,
      totalValueUsd: positions.reduce((acc, p) => acc + p.valueUsd, 0),
    };
  }

  async getHoldings(id: string): Promise<HoldingRow[]> {
    const latest = await prisma.filing.findFirst({
      where: { holderId: id },
      orderBy: { reportPeriod: "desc" },
    });
    if (!latest) return [];
    const positions = await prisma.position.findMany({
      where: { filingId: latest.id },
      include: { security: true },
    });
    const allFilings = await prisma.filing.findMany({
      where: { holderId: id },
      orderBy: { reportPeriod: "asc" },
      include: { positions: { select: { securityId: true } } },
    });
    const firstSeen = new Map<string, string>();
    for (const f of allFilings) {
      const period = f.reportPeriod.toISOString().slice(0, 10);
      for (const p of f.positions) {
        if (!firstSeen.has(p.securityId)) firstSeen.set(p.securityId, period);
      }
    }
    return positions
      .map<HoldingRow>((p) => ({
        ticker: p.security.ticker,
        issuerName: p.security.issuerName,
        cusip: p.security.cusip,
        shares: p.shares,
        valueUsd: p.valueUsd,
        portfolioWeight: p.portfolioWeight,
        firstSeen: firstSeen.get(p.securityId) ?? "—",
        lastReport: latest.reportPeriod.toISOString().slice(0, 10),
        themes: themesForCusip(p.security.cusip),
      }))
      .sort((a, b) => b.valueUsd - a.valueUsd);
  }

  async getChanges(id: string): Promise<ChangeRow[]> {
    const fs = await prisma.filing.findMany({
      where: { holderId: id },
      orderBy: { reportPeriod: "desc" },
      take: 2,
    });
    if (fs.length === 0) return [];
    const [curr, prev] = fs;
    const currPos = await prisma.position.findMany({ where: { filingId: curr.id }, include: { security: true } });
    const prevPos = prev
      ? await prisma.position.findMany({ where: { filingId: prev.id }, include: { security: true } })
      : [];

    const changes = diffPositions({
      holderId: id,
      currentFilingId: curr.id,
      previousFilingId: prev?.id ?? null,
      currentPositions: currPos.map(toDomainPosition),
      previousPositions: prevPos.map(toDomainPosition),
    });

    const secById = new Map<string, (typeof currPos)[number]["security"]>();
    for (const p of [...currPos, ...prevPos]) secById.set(p.securityId, p.security);

    const order: Record<ChangeType, number> = { NEW: 0, REMOVED: 1, INCREASED: 2, DECREASED: 3, UNCHANGED: 4 };
    return changes
      .filter((c) => c.changeType !== "UNCHANGED")
      .map<ChangeRow>((c) => {
        const sec = secById.get(c.securityId);
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
    const fs = await prisma.filing.findMany({
      where: { holderId: id },
      orderBy: { reportPeriod: "desc" },
    });
    return fs.map(toFiling);
  }

  async listCompanies(query?: { theme?: string; search?: string }): Promise<CompanyRow[]> {
    const q = query?.search?.trim().toLowerCase();
    const theme = query?.theme?.trim().toLowerCase();

    const holders = await prisma.holder.findMany({ where: { tracked: true } });
    if (holders.length === 0) return [];
    const holderById = new Map(holders.map((h) => [h.id, h]));

    // Find the latest filing per holder in one query.
    const filings = await prisma.filing.findMany({
      where: { holderId: { in: holders.map((h) => h.id) } },
      orderBy: { reportPeriod: "desc" },
      select: { id: true, holderId: true, reportPeriod: true },
    });
    const latestByHolder = new Map<string, string>();
    for (const f of filings) {
      if (!latestByHolder.has(f.holderId)) latestByHolder.set(f.holderId, f.id);
    }
    const latestFilingIds = Array.from(latestByHolder.values());
    if (latestFilingIds.length === 0) return [];

    const positions = await prisma.position.findMany({
      where: { filingId: { in: latestFilingIds } },
      select: {
        valueUsd: true,
        securityId: true,
        filing: { select: { holderId: true } },
        security: {
          select: { id: true, ticker: true, issuerName: true, cusip: true, exchange: true, country: true },
        },
      },
    });

    type SecLite = { id: string; ticker: string | null; issuerName: string; cusip: string; exchange: string | null; country: string | null };
    const agg = new Map<string, { security: SecLite; owners: Map<string, number> }>();
    for (const p of positions) {
      let row = agg.get(p.securityId);
      if (!row) {
        row = { security: p.security, owners: new Map() };
        agg.set(p.securityId, row);
      }
      row.owners.set(p.filing.holderId, (row.owners.get(p.filing.holderId) ?? 0) + p.valueUsd);
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

  async syncHolder(id: string) {
    const holder = await prisma.holder.findUnique({ where: { id } });
    if (!holder?.cik) return { ok: false as const, error: "Holder not found or missing CIK" };
    const result = await syncCik(holder.cik);
    if (result.errors.length > 0 && result.filingsAdded === 0) {
      return { ok: false as const, error: result.errors.join("; ") };
    }
    const refreshed = await prisma.holder.findUnique({ where: { id } });
    return { ok: true as const, holder: holderRow(refreshed!) };
  }

  async syncAll() {
    const results = await syncAllSeeded();
    const synced = results.filter((r) => r.errors.length === 0).length;
    const failed = results.length - synced;

    const holders = await prisma.holder.findMany({ where: { tracked: true } });
    for (const h of holders) {
      const changes = await this.getChanges(h.id);
      await prisma.holder.update({
        where: { id: h.id },
        data: { latestStatus: computeHolderStatus(changes) },
      });
    }
    return { synced, failed };
  }
}
