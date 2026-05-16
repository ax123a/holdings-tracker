#!/usr/bin/env tsx
// CLI: npm run sync [--all] [--cik 0001067983] [--limit 4]
//
// Examples:
//   npm run sync -- --all                  # all seed holders, 4 latest filings each
//   npm run sync -- --cik 0001067983       # one holder
//   npm run sync -- --all --limit 2        # only the 2 latest filings per holder

import { config as loadEnv } from "dotenv";
loadEnv();

import { syncAllSeeded, syncCik } from "../lib/sec/sync";
import { SEED_HOLDERS } from "../lib/sec/seed-holders";

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { all: false, cik: undefined as string | undefined, limit: 4 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--all") opts.all = true;
    else if (a === "--cik") opts.cik = args[++i];
    else if (a === "--limit") opts.limit = parseInt(args[++i], 10) || 4;
  }
  return opts;
}

async function main() {
  const opts = parseArgs();

  if (!opts.all && !opts.cik) {
    console.log("Usage: npm run sync -- (--all | --cik <CIK>) [--limit <N>]");
    console.log("Seed holders:");
    for (const s of SEED_HOLDERS) console.log(`  ${s.cik}  ${s.displayCode.padEnd(6)} ${s.displayName}`);
    process.exit(1);
  }

  const t0 = Date.now();

  if (opts.cik) {
    console.log(`Syncing CIK ${opts.cik} (limit=${opts.limit})...`);
    const r = await syncCik(opts.cik, { limitFilings: opts.limit });
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log(`Syncing ${SEED_HOLDERS.length} seed holders (limit=${opts.limit} each)...`);
    const results = await syncAllSeeded({ limitFilings: opts.limit });
    let ok = 0;
    let fail = 0;
    let totalFilings = 0;
    let totalPositions = 0;
    for (const r of results) {
      const status = r.errors.length === 0 ? "OK" : "ERR";
      console.log(
        `[${status}] ${r.cik}  ${r.holderName?.slice(0, 40).padEnd(40)}  +${r.filingsAdded} filings, +${r.positionsAdded} positions${r.errors.length ? "  -- " + r.errors[0] : ""}`,
      );
      if (r.errors.length === 0) ok++; else fail++;
      totalFilings += r.filingsAdded;
      totalPositions += r.positionsAdded;
    }
    console.log("");
    console.log(`Done in ${Math.round((Date.now() - t0) / 1000)}s. ${ok} ok, ${fail} failed. +${totalFilings} filings, +${totalPositions} positions.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
