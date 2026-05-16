import type { ChangeType, HolderStatus, Position, PositionChange } from "./types";

export interface DiffInput {
  holderId: string;
  currentFilingId: string;
  previousFilingId: string | null;
  currentPositions: Position[];
  previousPositions: Position[];
}

// A position is identified by securityId (CUSIP-derived). We intentionally
// ignore classTitle/putCall here — callers should pre-aggregate if they want
// those split out, but the spec treats one security = one position per filing.
function positionKey(p: Position): string {
  return p.securityId;
}

/**
 * Compare two position sets and return a PositionChange per unique security.
 * Covers the five ChangeType variants from the spec: NEW, REMOVED, INCREASED,
 * DECREASED, UNCHANGED.
 */
export function diffPositions(input: DiffInput): Omit<PositionChange, "id">[] {
  const { holderId, currentFilingId, previousFilingId, currentPositions, previousPositions } = input;

  const prevMap = new Map<string, Position>();
  for (const p of previousPositions) prevMap.set(positionKey(p), p);

  const currMap = new Map<string, Position>();
  for (const p of currentPositions) currMap.set(positionKey(p), p);

  const seen = new Set<string>();
  const out: Omit<PositionChange, "id">[] = [];

  for (const [key, curr] of currMap) {
    seen.add(key);
    const prev = prevMap.get(key);
    if (!prev) {
      out.push({
        holderId,
        currentFilingId,
        previousFilingId,
        securityId: curr.securityId,
        changeType: "NEW",
        previousShares: null,
        currentShares: curr.shares,
        sharesDelta: curr.shares,
        previousValueUsd: null,
        currentValueUsd: curr.valueUsd,
        valueDeltaUsd: curr.valueUsd,
      });
      continue;
    }

    const delta = curr.shares - prev.shares;
    const valDelta = curr.valueUsd - prev.valueUsd;
    let changeType: ChangeType;
    if (delta > 0) changeType = "INCREASED";
    else if (delta < 0) changeType = "DECREASED";
    else changeType = "UNCHANGED";

    out.push({
      holderId,
      currentFilingId,
      previousFilingId,
      securityId: curr.securityId,
      changeType,
      previousShares: prev.shares,
      currentShares: curr.shares,
      sharesDelta: delta,
      previousValueUsd: prev.valueUsd,
      currentValueUsd: curr.valueUsd,
      valueDeltaUsd: valDelta,
    });
  }

  for (const [key, prev] of prevMap) {
    if (seen.has(key)) continue;
    out.push({
      holderId,
      currentFilingId,
      previousFilingId,
      securityId: prev.securityId,
      changeType: "REMOVED",
      previousShares: prev.shares,
      currentShares: null,
      sharesDelta: -prev.shares,
      previousValueUsd: prev.valueUsd,
      currentValueUsd: null,
      valueDeltaUsd: -prev.valueUsd,
    });
  }

  return out;
}

/** Roll up a set of PositionChanges into the holder-level status for the list view. */
export function computeHolderStatus(changes: { changeType: ChangeType }[]): HolderStatus {
  let hasNew = false;
  let hasRemoved = false;
  for (const c of changes) {
    if (c.changeType === "NEW") hasNew = true;
    else if (c.changeType === "REMOVED") hasRemoved = true;
    if (hasNew && hasRemoved) break;
  }
  if (hasNew && hasRemoved) return "ADDED_AND_REMOVED";
  if (hasNew) return "ADDED";
  if (hasRemoved) return "REMOVED";
  return "NONE";
}

export function statusLabel(s: HolderStatus): string {
  switch (s) {
    case "ADDED":
      return "New stocks added";
    case "REMOVED":
      return "Stocks removed";
    case "ADDED_AND_REMOVED":
      return "Added & removed";
    case "NONE":
    default:
      return "";
  }
}
