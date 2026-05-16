#!/usr/bin/env tsx
// Read Prisma (SQLite) → write data/snapshot.json.
//
// The snapshot is what ships in the production build. Generated locally
// after `npm run sync -- --all`, then committed. Vercel never touches SQLite.
//
// Run: npm run snapshot

import { config as loadEnv } from "dotenv";
loadEnv();

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../lib/db";

async function main() {
  const t0 = Date.now();

  const [holders, filings, securities, positions] = await Promise.all([
    prisma.holder.findMany({ orderBy: { displayCode: "asc" } }),
    prisma.filing.findMany({ orderBy: { reportPeriod: "desc" } }),
    prisma.security.findMany(),
    prisma.position.findMany(),
  ]);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    holders: holders.map((h) => ({
      id: h.id,
      displayCode: h.displayCode,
      displayName: h.displayName,
      legalName: h.legalName,
      cik: h.cik,
      sourceType: h.sourceType,
      latestStatus: h.latestStatus,
      latestReportPeriod: h.latestReportPeriod?.toISOString() ?? null,
      latestFilingDate: h.latestFilingDate?.toISOString() ?? null,
      managerName: h.managerName,
      managerTitle: h.managerTitle,
      tracked: h.tracked,
    })),
    filings: filings.map((f) => ({
      id: f.id,
      holderId: f.holderId,
      accessionNumber: f.accessionNumber,
      filingType: f.filingType,
      reportPeriod: f.reportPeriod.toISOString(),
      filedAt: f.filedAt.toISOString(),
      sourceUrl: f.sourceUrl,
      isAmendment: f.isAmendment,
    })),
    securities: securities.map((s) => ({
      id: s.id,
      cusip: s.cusip,
      ticker: s.ticker,
      issuerName: s.issuerName,
      exchange: s.exchange,
      country: s.country,
    })),
    positions: positions.map((p) => ({
      id: p.id,
      filingId: p.filingId,
      securityId: p.securityId,
      shares: p.shares,
      valueUsd: p.valueUsd,
      classTitle: p.classTitle,
      putCall: p.putCall,
      portfolioWeight: p.portfolioWeight,
    })),
  };

  const dataDir = join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  const out = join(dataDir, "snapshot.json");
  writeFileSync(out, JSON.stringify(snapshot));

  const sizeMb = (Buffer.byteLength(JSON.stringify(snapshot)) / 1024 / 1024).toFixed(1);
  console.log(
    `Wrote ${out} in ${Date.now() - t0}ms — ${holders.length} holders, ${filings.length} filings, ${securities.length} securities, ${positions.length} positions (${sizeMb} MB).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
