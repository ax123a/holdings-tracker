import { describe, expect, it } from "vitest";
import { mockData } from "@/lib/providers/mock-data";
import { MockProvider } from "@/lib/providers/mock";

const REQUIRED_AI = [
  "NVDA", "AMD", "TSM", "ASML", "ARM", "AVGO", "MSFT", "GOOGL", "AMZN",
  "META", "ORCL", "CRM", "SNOW", "MDB", "NOW", "PLTR", "SMCI", "ANET",
  "AI", "SOUN", "BBAI",
];

const REQUIRED_SPACE = [
  "RKLB", "ASTS", "IRDM", "SPIR", "PL", "LMT", "NOC", "RTX", "LHX", "BA",
];

function tickerSet() {
  return new Set(
    mockData.securities.map((s) => s.ticker).filter((t): t is string => !!t)
  );
}

describe("mock dataset coverage", () => {
  it("includes every required AI / semis / cloud ticker from the spec", () => {
    const tickers = tickerSet();
    const missing = REQUIRED_AI.filter((t) => !tickers.has(t));
    expect(missing, `missing AI tickers: ${missing.join(", ")}`).toEqual([]);
  });

  it("includes every required space / aerospace / defense ticker from the spec", () => {
    const tickers = tickerSet();
    const missing = REQUIRED_SPACE.filter((t) => !tickers.has(t));
    expect(missing, `missing space tickers: ${missing.join(", ")}`).toEqual([]);
  });

  it("tags AI tickers with the ai theme", () => {
    const aiTickers = mockData.securities
      .filter((s) => s.themes.includes("ai"))
      .map((s) => s.ticker);
    expect(aiTickers).toContain("NVDA");
    expect(aiTickers).toContain("PLTR");
    expect(aiTickers).toContain("AI");
  });

  it("tags space tickers with the space theme", () => {
    const spaceTickers = mockData.securities
      .filter((s) => s.themes.includes("space"))
      .map((s) => s.ticker);
    expect(spaceTickers).toContain("RKLB");
    expect(spaceTickers).toContain("ASTS");
    expect(spaceTickers).toContain("PL");
  });

  it("defines at least 60 securities total", () => {
    expect(mockData.securities.length).toBeGreaterThanOrEqual(60);
  });

  it("every security has a unique CUSIP", () => {
    const cusips = mockData.securities.map((s) => s.cusip);
    expect(new Set(cusips).size).toBe(cusips.length);
  });

  it("every security has a unique id", () => {
    const ids = mockData.securities.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every position references a known security and filing", () => {
    const sids = new Set(mockData.securities.map((s) => s.id));
    const fids = new Set(mockData.filings.map((f) => f.id));
    for (const p of mockData.positions) {
      expect(sids.has(p.securityId), `bad securityId ${p.securityId}`).toBe(true);
      expect(fids.has(p.filingId), `bad filingId ${p.filingId}`).toBe(true);
    }
  });
});

describe("MockProvider business logic", () => {
  it("returns at least 10 holdings for Bridgewater (the row that previously looked truncated)", async () => {
    const p = new MockProvider();
    const holdings = await p.getHoldings("h-brdg");
    expect(holdings.length).toBeGreaterThanOrEqual(10);
  });

  it("recomputes holder statuses to match the actual diff", async () => {
    const p = new MockProvider();
    const holders = await p.listHolders();
    // Demo set guarantees coverage of all four status variants:
    const statuses = new Set(holders.map((h) => h.latestStatus));
    expect(statuses.has("ADDED")).toBe(true);
    expect(statuses.has("REMOVED")).toBe(true);
    expect(statuses.has("ADDED_AND_REMOVED")).toBe(true);
    expect(statuses.has("NONE")).toBe(true);
  });

  it("listCompanies filters by theme", async () => {
    const p = new MockProvider();
    const ai = await p.listCompanies({ theme: "ai" });
    expect(ai.length).toBeGreaterThanOrEqual(15);
    expect(ai.every((c) => c.security.themes.includes("ai"))).toBe(true);
  });

  it("listCompanies returns space companies when filtered by theme=space", async () => {
    const p = new MockProvider();
    const space = await p.listCompanies({ theme: "space" });
    const tickers = space.map((c) => c.security.ticker);
    expect(tickers).toContain("RKLB");
    expect(tickers).toContain("ASTS");
  });

  it("listCompanies search matches issuer name and ticker", async () => {
    const p = new MockProvider();
    const byTicker = await p.listCompanies({ search: "nvda" });
    expect(byTicker.map((c) => c.security.ticker)).toContain("NVDA");
    const byName = await p.listCompanies({ search: "rocket lab" });
    expect(byName.map((c) => c.security.ticker)).toContain("RKLB");
  });

  it("holder portfolio totals match sum of position values", async () => {
    const p = new MockProvider();
    const detail = await p.getHolder("h-brdg");
    const holdings = await p.getHoldings("h-brdg");
    expect(detail).not.toBeNull();
    const sum = holdings.reduce((acc, h) => acc + h.valueUsd, 0);
    expect(detail!.totalValueUsd).toBeCloseTo(sum, 2);
    expect(detail!.totalHoldings).toBe(holdings.length);
  });
});
