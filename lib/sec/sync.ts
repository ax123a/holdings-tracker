// Phase 2: real SEC 13F sync.
//
// For a given CIK:
//   1. Fetch recent 13F-HR filings from data.sec.gov submissions index.
//   2. Upsert Holder + Filing records.
//   3. Parse the InformationTable XML and upsert Security + Position rows.
//
// Idempotent: re-running a sync against the same accession number is a no-op
// for that filing (we skip if a Filing with the same accessionNumber exists).

import { prisma } from "@/lib/db";
import { fetchHolderFilings, type FilingRef } from "@/lib/sec/filings";
import { parseInformationTable, parseSignatory } from "@/lib/sec/parser";
import { lookupCusip } from "@/lib/sec/cusip-map";
import { padCik } from "@/lib/sec/client";
import { SEED_HOLDERS } from "@/lib/sec/seed-holders";

export type SyncResult = {
  cik: string;
  holderName: string;
  filingsAdded: number;
  filingsSkipped: number;
  positionsAdded: number;
  errors: string[];
};

function deriveDisplayCode(cik: string, name: string): string {
  const seed = SEED_HOLDERS.find((s) => s.cik === padCik(cik));
  if (seed) return seed.displayCode;
  // Fall back to the first 4 alphanumerics of legal name.
  return (name.replace(/[^A-Z0-9]/gi, "").slice(0, 6) || "FUND").toUpperCase();
}

function deriveDisplayName(cik: string, name: string): string {
  const seed = SEED_HOLDERS.find((s) => s.cik === padCik(cik));
  return seed?.displayName ?? name;
}

async function upsertHolder(cik: string, legalName: string) {
  const padded = padCik(cik);
  const existing = await prisma.holder.findUnique({ where: { cik: padded } });
  if (existing) return existing;

  // displayCode must be unique. If colliding, append last 4 of CIK.
  const baseCode = deriveDisplayCode(padded, legalName);
  let displayCode = baseCode;
  if (await prisma.holder.findUnique({ where: { displayCode } })) {
    displayCode = `${baseCode}-${padded.slice(-4)}`;
  }

  return prisma.holder.create({
    data: {
      displayCode,
      displayName: deriveDisplayName(padded, legalName),
      legalName,
      cik: padded,
      sourceType: "SEC_13F",
      tracked: true,
    },
  });
}

async function upsertSecurity(cusip: string, issuerName: string) {
  const upper = cusip.toUpperCase();
  const mapped = lookupCusip(upper);
  return prisma.security.upsert({
    where: { cusip: upper },
    update: {
      // If we previously stored without a ticker but now have one, fill it in.
      ticker: mapped?.ticker ?? undefined,
      issuerName: mapped?.issuerName ?? issuerName,
      exchange: mapped?.exchange ?? undefined,
      country: mapped?.country ?? undefined,
    },
    create: {
      cusip: upper,
      ticker: mapped?.ticker ?? null,
      issuerName: mapped?.issuerName ?? issuerName,
      exchange: mapped?.exchange ?? null,
      country: mapped?.country ?? null,
    },
  });
}

async function ingestFiling(holderId: string, ref: FilingRef): Promise<{ added: boolean; positionsAdded: number; error?: string }> {
  const existing = await prisma.filing.findUnique({ where: { accessionNumber: ref.accessionNumber } });
  if (existing) return { added: false, positionsAdded: 0 };

  let holdings;
  try {
    holdings = await parseInformationTable(ref);
  } catch (e) {
    return { added: false, positionsAdded: 0, error: `parse failed for ${ref.accessionNumber}: ${(e as Error).message}` };
  }

  const filing = await prisma.filing.create({
    data: {
      holderId,
      accessionNumber: ref.accessionNumber,
      filingType: ref.filingType === "13F-HR/A" ? "THIRTEEN_F_HR_A" : "THIRTEEN_F_HR",
      reportPeriod: new Date(ref.reportPeriod),
      filedAt: new Date(ref.filedAt),
      sourceUrl: `https://www.sec.gov/Archives/edgar/data/${parseInt(ref.cik, 10)}/${ref.accessionDashless}/`,
      isAmendment: ref.filingType === "13F-HR/A",
    },
  });

  const totalValue = holdings.reduce((acc, h) => acc + h.value, 0);
  let positionsAdded = 0;

  // Aggregate by (cusip + classTitle + putCall) so we don't violate the
  // implied-uniqueness invariant (multiple infoTable rows for the same
  // CUSIP across investment managers within the same filer).
  const agg = new Map<string, { security: { id: string }; shares: number; value: number; classTitle: string; putCall: string | null }>();
  for (const h of holdings) {
    const sec = await upsertSecurity(h.cusip, h.nameOfIssuer);
    const key = `${sec.id}|${h.titleOfClass}|${h.putCall ?? ""}`;
    const prev = agg.get(key);
    if (prev) {
      prev.shares += h.shares;
      prev.value += h.value;
    } else {
      agg.set(key, {
        security: { id: sec.id },
        shares: h.shares,
        value: h.value,
        classTitle: h.titleOfClass,
        putCall: h.putCall,
      });
    }
  }

  for (const p of agg.values()) {
    await prisma.position.create({
      data: {
        filingId: filing.id,
        securityId: p.security.id,
        shares: p.shares,
        valueUsd: p.value,
        classTitle: p.classTitle,
        putCall: p.putCall,
        portfolioWeight: totalValue > 0 ? Math.round((p.value / totalValue) * 10000) / 100 : null,
      },
    });
    positionsAdded += 1;
  }

  return { added: true, positionsAdded };
}

export async function syncCik(cik: string, opts?: { limitFilings?: number }): Promise<SyncResult> {
  const padded = padCik(cik);
  const limit = opts?.limitFilings ?? 4;
  const result: SyncResult = {
    cik: padded,
    holderName: "",
    filingsAdded: 0,
    filingsSkipped: 0,
    positionsAdded: 0,
    errors: [],
  };

  let listed;
  try {
    listed = await fetchHolderFilings(padded, limit);
  } catch (e) {
    result.errors.push(`submissions fetch failed: ${(e as Error).message}`);
    return result;
  }
  result.holderName = listed.name;

  if (listed.filings.length === 0) {
    result.errors.push(`no 13F-HR filings found for CIK ${padded}`);
    return result;
  }

  const holder = await upsertHolder(padded, listed.name);

  for (const ref of listed.filings) {
    try {
      const r = await ingestFiling(holder.id, ref);
      if (r.error) result.errors.push(r.error);
      if (r.added) {
        result.filingsAdded += 1;
        result.positionsAdded += r.positionsAdded;
      } else {
        result.filingsSkipped += 1;
      }
    } catch (e) {
      result.errors.push(`ingest failed for ${ref.accessionNumber}: ${(e as Error).message}`);
    }
  }

  // Refresh holder.latestReportPeriod / latestFilingDate from latest filing on disk.
  // Also parse signatory from the most recent filing's primary_doc.xml.
  const latest = await prisma.filing.findFirst({
    where: { holderId: holder.id },
    orderBy: { reportPeriod: "desc" },
  });
  if (latest) {
    const latestRef = listed.filings[0];
    const sig = latestRef ? await parseSignatory(latestRef) : { name: null, title: null };
    await prisma.holder.update({
      where: { id: holder.id },
      data: {
        latestReportPeriod: latest.reportPeriod,
        latestFilingDate: latest.filedAt,
        managerName: sig.name ?? undefined,
        managerTitle: sig.title ?? undefined,
      },
    });
  }

  return result;
}

export async function syncAllSeeded(opts?: { limitFilings?: number }): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  for (const seed of SEED_HOLDERS) {
    const r = await syncCik(seed.cik, opts);
    results.push(r);
  }
  return results;
}
