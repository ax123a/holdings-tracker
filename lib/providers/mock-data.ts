// LOCAL 13F DATASET — top-level assembler.
// NOT LIVE. DEMO DATA.
//
// What is real:
//   - Holder legal names + CIKs (public SEC registry).
//   - Security tickers, issuer names, CUSIPs (public market identifiers).
//
// What is synthetic:
//   - All share counts, market values, portfolio weights.
//   - All filing accession numbers.
//   - All holder→security pairings (shaped by each manager's known strategy,
//     not by their actual filings). A few well-known concentrated holders
//     (Berkshire, Pershing Square, Sequoia, ARK, Trian) get hand-curated
//     plausible top holdings.

import type { Filing, Holder, Position, Security } from "@/lib/types";
import { SEC_DEFS } from "./mock/securities";
import { HOLDER_DEFS } from "./mock/holders";
import {
  buildPortfolio,
  makeFiling,
  pickSecurities,
  planChurn,
  quarterEndsRelativeToToday,
} from "./mock/generator";

export interface MockDataset {
  holders: Holder[];
  securities: Security[];
  filings: Filing[];
  positions: Position[];
}

const PERIODS = quarterEndsRelativeToToday();

const SECURITIES: Security[] = SEC_DEFS.map((s) => ({
  id: s.id,
  ticker: s.ticker,
  cusip: s.cusip,
  issuerName: s.issuerName,
  exchange: s.exchange,
  country: s.country,
  themes: s.themes,
}));

const holders: Holder[] = HOLDER_DEFS.map((h) => ({
  id: h.id,
  displayCode: h.code,
  displayName: h.name,
  legalName: h.legal,
  cik: h.cik,
  sourceType: "MOCK",
  latestStatus: "NONE",
  latestReportPeriod: h.targetSize > 0 ? PERIODS.currentPeriod : null,
  latestFilingDate: h.targetSize > 0 ? PERIODS.currentFiledAt : null,
  tracked: true,
}));

const filings: Filing[] = [];
const positions: Position[] = [];

for (const hdef of HOLDER_DEFS) {
  if (hdef.targetSize === 0) continue;

  const baseSecs = pickSecurities(hdef);
  const { prevSecs, currSecs } = planChurn(hdef, baseSecs);

  const prevF = makeFiling(hdef, "prev", PERIODS.previousPeriod, PERIODS.previousFiledAt);
  const currF = makeFiling(hdef, "curr", PERIODS.currentPeriod, PERIODS.currentFiledAt);
  filings.push(prevF, currF);
  positions.push(...buildPortfolio(hdef, prevF.id, prevSecs, "prev"));
  positions.push(...buildPortfolio(hdef, currF.id, currSecs, "curr"));
}

export const mockData: MockDataset = {
  holders,
  securities: SECURITIES,
  filings,
  positions,
};
