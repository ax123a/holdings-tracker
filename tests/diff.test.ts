import { describe, expect, it } from "vitest";
import { computeHolderStatus, diffPositions, statusLabel } from "@/lib/diff";
import type { Position } from "@/lib/types";

// Build a Position with just the fields diff cares about.
function p(securityId: string, shares: number, valueUsd: number): Position {
  return {
    id: `p-${securityId}`,
    filingId: "f-curr",
    securityId,
    shares,
    valueUsd,
    classTitle: "COM",
    putCall: null,
    portfolioWeight: null,
  };
}

const base = {
  holderId: "h-1",
  currentFilingId: "f-curr",
  previousFilingId: "f-prev" as string | null,
};

describe("diffPositions", () => {
  it("marks positions only in current as NEW", () => {
    const out = diffPositions({
      ...base,
      currentPositions: [p("A", 100, 1000)],
      previousPositions: [],
    });
    expect(out).toHaveLength(1);
    expect(out[0].changeType).toBe("NEW");
    expect(out[0].previousShares).toBeNull();
    expect(out[0].currentShares).toBe(100);
    expect(out[0].sharesDelta).toBe(100);
    expect(out[0].valueDeltaUsd).toBe(1000);
  });

  it("marks positions only in previous as REMOVED", () => {
    const out = diffPositions({
      ...base,
      currentPositions: [],
      previousPositions: [p("A", 100, 1000)],
    });
    expect(out).toHaveLength(1);
    expect(out[0].changeType).toBe("REMOVED");
    expect(out[0].currentShares).toBeNull();
    expect(out[0].sharesDelta).toBe(-100);
    expect(out[0].valueDeltaUsd).toBe(-1000);
  });

  it("marks share increases as INCREASED with correct delta", () => {
    const out = diffPositions({
      ...base,
      currentPositions: [p("A", 150, 1500)],
      previousPositions: [p("A", 100, 1000)],
    });
    expect(out[0].changeType).toBe("INCREASED");
    expect(out[0].sharesDelta).toBe(50);
    expect(out[0].valueDeltaUsd).toBe(500);
  });

  it("marks share decreases as DECREASED with negative delta", () => {
    const out = diffPositions({
      ...base,
      currentPositions: [p("A", 60, 600)],
      previousPositions: [p("A", 100, 1000)],
    });
    expect(out[0].changeType).toBe("DECREASED");
    expect(out[0].sharesDelta).toBe(-40);
    expect(out[0].valueDeltaUsd).toBe(-400);
  });

  it("marks identical shares as UNCHANGED even if value drifted", () => {
    const out = diffPositions({
      ...base,
      currentPositions: [p("A", 100, 1200)],
      previousPositions: [p("A", 100, 1000)],
    });
    expect(out[0].changeType).toBe("UNCHANGED");
    expect(out[0].sharesDelta).toBe(0);
    expect(out[0].valueDeltaUsd).toBe(200);
  });

  it("handles a mixed set: NEW + REMOVED + INCREASED", () => {
    const out = diffPositions({
      ...base,
      currentPositions: [p("A", 150, 1500), p("C", 10, 100)], // A up, C new
      previousPositions: [p("A", 100, 1000), p("B", 50, 500)], // B dropped
    });
    const byId = Object.fromEntries(out.map((c) => [c.securityId, c.changeType]));
    expect(byId).toEqual({ A: "INCREASED", B: "REMOVED", C: "NEW" });
  });

  it("handles no previous filing by treating everything as NEW", () => {
    const out = diffPositions({
      holderId: "h-1",
      currentFilingId: "f-curr",
      previousFilingId: null,
      currentPositions: [p("A", 100, 1000), p("B", 50, 500)],
      previousPositions: [],
    });
    expect(out.every((c) => c.changeType === "NEW")).toBe(true);
    expect(out.every((c) => c.previousFilingId === null)).toBe(true);
  });
});

describe("computeHolderStatus", () => {
  it("returns NONE when no NEW or REMOVED present", () => {
    expect(computeHolderStatus([{ changeType: "UNCHANGED" }, { changeType: "INCREASED" }])).toBe("NONE");
  });

  it("returns ADDED when only NEW present", () => {
    expect(computeHolderStatus([{ changeType: "NEW" }, { changeType: "INCREASED" }])).toBe("ADDED");
  });

  it("returns REMOVED when only REMOVED present", () => {
    expect(computeHolderStatus([{ changeType: "REMOVED" }, { changeType: "DECREASED" }])).toBe("REMOVED");
  });

  it("returns ADDED_AND_REMOVED when both present", () => {
    expect(
      computeHolderStatus([{ changeType: "NEW" }, { changeType: "REMOVED" }, { changeType: "UNCHANGED" }])
    ).toBe("ADDED_AND_REMOVED");
  });

  it("returns NONE for an empty list (edge case)", () => {
    expect(computeHolderStatus([])).toBe("NONE");
  });
});

describe("statusLabel", () => {
  it("maps enum values to spec-defined labels", () => {
    expect(statusLabel("ADDED")).toBe("New stocks added");
    expect(statusLabel("REMOVED")).toBe("Stocks removed");
    expect(statusLabel("ADDED_AND_REMOVED")).toBe("Added & removed");
    expect(statusLabel("NONE")).toBe("");
  });
});
