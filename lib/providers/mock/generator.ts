// LOCAL 13F DATASET — generator.
// Deterministic synthetic portfolios from a seeded PRNG, driven by holder
// strategy bias and the security universe.

import type { Filing, Position } from "@/lib/types";
import { SEC_DEFS, SEC_BY_ID } from "./securities";
import { CONCENTRATED, STRATEGY_BIAS, type HolderDef } from "./holders";

export function quarterEndsRelativeToToday(now = new Date()) {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  let curEndY = y;
  let curEndM = 0;
  if (m >= 9) curEndM = 8;
  else if (m >= 6) curEndM = 5;
  else if (m >= 3) curEndM = 2;
  else {
    curEndY = y - 1;
    curEndM = 11;
  }
  const curEnd = new Date(Date.UTC(curEndY, curEndM + 1, 0));
  const prevEnd = new Date(
    Date.UTC(curEnd.getUTCFullYear(), curEnd.getUTCMonth() - 2, 0),
  );
  const filed = new Date(curEnd);
  filed.setUTCDate(filed.getUTCDate() + 45);
  const prevFiled = new Date(prevEnd);
  prevFiled.setUTCDate(prevFiled.getUTCDate() + 45);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return {
    currentPeriod: iso(curEnd),
    currentFiledAt: iso(filed),
    previousPeriod: iso(prevEnd),
    previousFiledAt: iso(prevFiled),
  };
}

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rngFor(seed: string) {
  let s = hashStr(seed);
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundShares(n: number): number {
  if (n >= 10_000_000) return Math.round(n / 100_000) * 100_000;
  if (n >= 1_000_000) return Math.round(n / 10_000) * 10_000;
  if (n >= 100_000) return Math.round(n / 1_000) * 1_000;
  return Math.max(100, Math.round(n / 100) * 100);
}
function roundValue(n: number): number {
  if (n >= 1_000_000_000) return Math.round(n / 1_000_000) * 1_000_000;
  if (n >= 100_000_000) return Math.round(n / 100_000) * 100_000;
  return Math.max(10_000, Math.round(n / 10_000) * 10_000);
}

const AUM_BY_STRATEGY: Record<string, number> = {
  "passive-giant": 800_000_000_000,
  "sovereign": 250_000_000_000,
  "large-active": 200_000_000_000,
  "value-concentrated": 60_000_000_000,
  "value-quality": 40_000_000_000,
  "value": 25_000_000_000,
  "value-event": 15_000_000_000,
  "macro": 40_000_000_000,
  "quant-broad": 80_000_000_000,
  "hedge-multi": 70_000_000_000,
  "growth-tech": 20_000_000_000,
  "growth-value": 15_000_000_000,
  "activist": 12_000_000_000,
  "healthcare": 5_000_000_000,
  "healthcare-growth": 30_000_000_000,
  "alternatives": 30_000_000_000,
  "innovation": 12_000_000_000,
};

export function pickSecurities(hdef: HolderDef): string[] {
  if (CONCENTRATED[hdef.id]) {
    return CONCENTRATED[hdef.id].slice(0, hdef.targetSize);
  }
  const bias = STRATEGY_BIAS[hdef.strategy];
  const rnd = rngFor(`${hdef.id}-pick`);
  const weighted = SEC_DEFS.map((s) => {
    let w = 1;
    for (const t of s.themes) w += bias[t] ?? 0;
    return { id: s.id, w };
  });
  const picked: string[] = [];
  const pool = weighted.slice();
  const target = Math.min(hdef.targetSize, pool.length);
  for (let i = 0; i < target; i++) {
    const total = pool.reduce((acc, p) => acc + p.w, 0);
    let r = rnd() * total;
    let idx = 0;
    for (let j = 0; j < pool.length; j++) {
      r -= pool[j].w;
      if (r <= 0) { idx = j; break; }
    }
    picked.push(pool[idx].id);
    pool.splice(idx, 1);
  }
  return picked;
}

let POSITION_SEQ = 0;
function makePos(filingId: string, sid: string, shares: number, valueUsd: number, weight: number): Position {
  POSITION_SEQ += 1;
  return {
    id: `p-${POSITION_SEQ}`,
    filingId,
    securityId: sid,
    shares,
    valueUsd,
    classTitle: "COM",
    putCall: null,
    portfolioWeight: weight,
  };
}

export function makeFiling(
  hdef: HolderDef,
  suffix: "prev" | "curr",
  period: string,
  filed: string,
): Filing {
  return {
    id: `f-${hdef.id.slice(2)}-${suffix}`,
    holderId: hdef.id,
    accessionNumber: `${(hdef.cik ?? "0000000000").slice(-10)}-25-${suffix === "curr" ? "010000" : "006000"}`,
    filingType: "THIRTEEN_F_HR",
    reportPeriod: period,
    filedAt: filed,
    sourceUrl: hdef.cik
      ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${hdef.cik}&type=13F`
      : null,
    isAmendment: false,
  };
}

export function buildPortfolio(
  hdef: HolderDef,
  filingId: string,
  secIds: string[],
  seedSalt: string,
): Position[] {
  const rnd = rngFor(`${hdef.id}-${seedSalt}`);
  const rawWeights = secIds.map((_, i) => {
    const rank = i + 1;
    const base = 1 / Math.pow(rank, 0.85);
    const jitter = 0.7 + rnd() * 0.6;
    return base * jitter;
  });
  const totalRaw = rawWeights.reduce((a, b) => a + b, 0);
  const aum = (AUM_BY_STRATEGY[hdef.strategy] ?? 20_000_000_000) * (0.7 + rnd() * 0.6);

  const out: Position[] = [];
  for (let i = 0; i < secIds.length; i++) {
    const sec = SEC_BY_ID.get(secIds[i]);
    if (!sec) continue;
    const weightPct = (rawWeights[i] / totalRaw) * 100;
    const dollarValue = (weightPct / 100) * aum;
    const shares = dollarValue / sec.refPrice;
    out.push(
      makePos(
        filingId,
        sec.id,
        roundShares(shares),
        roundValue(dollarValue),
        Math.round(weightPct * 100) / 100,
      ),
    );
  }
  return out;
}

export function planChurn(hdef: HolderDef, baseSecs: string[]) {
  const churn = rngFor(`${hdef.id}-churn`);
  const removeCount = Math.max(0, Math.min(3, Math.floor(churn() * 4)));
  const addCount = Math.max(0, Math.min(3, Math.floor(churn() * 4)));

  const currSecs = baseSecs.slice();
  const prevSecs = baseSecs.slice(0, baseSecs.length - addCount);

  if (removeCount > 0) {
    const pool = SEC_DEFS.map((s) => s.id).filter((id) => !currSecs.includes(id));
    for (let i = 0; i < removeCount && pool.length > 0; i++) {
      const idx = Math.floor(churn() * pool.length);
      prevSecs.push(pool[idx]);
      pool.splice(idx, 1);
    }
  }
  return { prevSecs, currSecs };
}
