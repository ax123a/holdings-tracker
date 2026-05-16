# Holdings Tracker

Compact stock-quote-board UI for visualising public stock holdings disclosed by SEC 13F filers. Built with Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, and Prisma.

> **This repository ships a demo dataset, not live data.** All numbers are synthetic. The app shows a persistent yellow banner and a `DEMO DATA` badge while in this mode. Switching to real EDGAR ingestion is a separate project — see [Switching to live 13F data](#switching-to-live-13f-data).

## Quick start (demo mode, no DB required)

```bash
cp .env.example .env
npm install
npm run dev
```

Then open http://localhost:3000.

## What's in the demo dataset

- **8 holders** — Berkshire, Bridgewater, Renaissance, Blackstone, Baupost, Two Sigma, Viking, plus one empty holder for empty-state coverage.
- **~70 securities** with theme tags. Required spec coverage:
  - **AI / semis / cloud:** NVDA, AMD, TSM, ASML, ARM, AVGO, MSFT, GOOGL, AMZN, META, ORCL, CRM, SNOW, MDB, NOW, PLTR, SMCI, ANET, AI, SOUN, BBAI
  - **Space / aerospace / defense:** RKLB, ASTS, IRDM, SPIR, PL, LMT, NOC, RTX, LHX, BA
  - Plus mega-cap consumer, finance, energy, healthcare, industrial, auto for portfolio breadth.
- **Two filings per holder** — previous quarter and current quarter. Periods advance with the calendar so dates always look fresh; a `~45-day lag` note is shown on detail pages so users understand 13F is quarterly and delayed.
- Per-holder portfolios contain **12–22 positions**, with at least one of each status variant (`ADDED`, `REMOVED`, `ADDED_AND_REMOVED`, `NONE`).
- The numbers are deliberately rounded to make the synthetic nature obvious. CUSIPs are real (used as canonical security IDs).

## Pages

- `/` — compact 2-column holder list with status (Name · Status)
- `/holders/[id]` — header + Current Holdings · Recent Changes · Filing History tabs
- `/companies` — every tracked security, filterable by theme (AI, Space, Cloud, Defense, …), with a list of which demo holders own it

## Status logic

After diffing the latest filing vs. the previous one:

| Rule                                         | Status shown            |
| -------------------------------------------- | ----------------------- |
| At least one `NEW` change                    | `New stocks added`      |
| At least one `REMOVED` change                | `Stocks removed`        |
| Both `NEW` and `REMOVED` present             | `Added & removed`       |
| Only `INCREASED`/`DECREASED`/`UNCHANGED`     | blank                   |

`MockProvider` recomputes every holder's status from its actual diff at startup, so the seed file doesn't have to maintain status values by hand.

## API routes

| Method | Path                                | Purpose                                      |
| ------ | ----------------------------------- | -------------------------------------------- |
| GET    | `/api/holders?q=…`                  | list holders (optional search)               |
| POST   | `/api/holders`                      | add a tracked holder (mock: accepts, no-op)  |
| GET    | `/api/holders/:id`                  | holder detail + totals                       |
| GET    | `/api/holders/:id/holdings`         | current holdings                             |
| GET    | `/api/holders/:id/changes`          | latest-vs-previous diff rows                 |
| POST   | `/api/holders/:id/sync`             | recompute `latestStatus`                     |
| POST   | `/api/sync/all`                     | sync every tracked holder                    |
| GET    | `/api/companies?theme=&q=`          | tracked-securities list with theme filter    |

## Adding a new ticker to the demo

1. Add a row to `SECURITIES_RAW` in `lib/providers/mock-data.ts` with a unique id, ticker, CUSIP, issuer, and one or more theme slugs.
2. (Optional) Reference its `id` from any holder's positions array to make it appear in someone's portfolio.
3. `npm test` to confirm the dataset still passes coverage tests.

## Switching to live 13F data

Set up Postgres and generate the Prisma client:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/holdings_tracker?schema=public"
DATA_PROVIDER=sec13f
SEC_USER_AGENT="Your Name your@email"

npm run db:migrate
```

Then implement `lib/providers/sec13f.ts`. The pipeline must:

1. Hit `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=<cik>&type=13F-HR` with the `SEC_USER_AGENT` header.
2. Download the primary `infotable.xml` document for each filing.
3. Parse `<infoTable>` rows — `nameOfIssuer`, `cusip`, `value` (×1000), `sshPrnamt`, `putCall`.
4. Upsert `Security` by CUSIP, `Filing` by `accessionNumber`, and `Position` by `(filingId, securityId, classTitle, putCall)`.
5. Call `diffPositions()` + `computeHolderStatus()` to persist `PositionChange` rows and update `Holder.latestStatus`.

The UI reads exclusively through the `HoldingsProvider` interface — once `sec13f.ts` implements it and `DATA_PROVIDER=sec13f`, no UI changes are needed and the demo banner automatically disappears.

## Domain notes

- **CIK** is the canonical holder identifier; `displayCode` is for the UI.
- **CUSIP** is the canonical security identifier; `ticker` is a best-effort map and may be `null` (rendered as `—`).
- 13F does not disclose trade-level buy dates, so the holdings table shows **First seen date** (earliest `reportPeriod` on which we saw the position) rather than a buy date.
- 13F filings are quarterly and reported with a ~45-day lag — even live data is not real-time.
- Holders with no filings render an empty state.

## Scripts

```bash
npm run dev         # Next dev server
npm run build       # Production build
npm run test        # Vitest unit tests
npm run db:migrate  # Prisma migrate dev (requires DATABASE_URL)
npm run db:studio   # Prisma Studio
```
