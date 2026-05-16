// Best-effort CUSIP → ticker mapping.
//
// 13F filings give CUSIPs, not tickers. There is no free, complete
// CUSIP↔ticker public dataset (CGS owns the database; OpenFIGI is free but
// rate-limited and requires a key for serious use).
//
// MVP approach: derive a static mapping from the 135 securities we already
// curated for Phase 1. Anything outside that list gets stored with ticker=null;
// the UI shows issuer name + CUSIP and never drops the row.
//
// Future work for higher coverage:
//   - OpenFIGI batch lookup (free, requires API key, 25 reqs/min).
//   - SEC company_tickers.json (only covers issuers with EDGAR registrations,
//     and indexes by CIK not CUSIP — useful for a CIK→ticker fallback).

import { SEC_DEFS } from "../providers/mock/securities";

const map = new Map<string, { ticker: string; exchange: string; country: string; issuerName: string; themes: string[] }>();
for (const s of SEC_DEFS) {
  map.set(s.cusip.toUpperCase(), {
    ticker: s.ticker,
    exchange: s.exchange,
    country: s.country,
    issuerName: s.issuerName,
    themes: s.themes,
  });
}

export function lookupCusip(cusip: string) {
  return map.get(cusip.toUpperCase()) ?? null;
}

export function themesForCusip(cusip: string): string[] {
  return map.get(cusip.toUpperCase())?.themes ?? [];
}

export function cusipMapSize(): number {
  return map.size;
}
