// Domain types — used by both the mock provider and the (future) Prisma-backed store.
// These mirror the Prisma models but are decoupled from the ORM so the UI and
// providers can share them without pulling in @prisma/client.

export type SourceType = "SEC_13F" | "MOCK" | "MANUAL";

export type FilingType = "THIRTEEN_F_HR" | "THIRTEEN_F_HR_A" | "OTHER";

export type ChangeType = "NEW" | "REMOVED" | "INCREASED" | "DECREASED" | "UNCHANGED";

export type HolderStatus = "NONE" | "ADDED" | "REMOVED" | "ADDED_AND_REMOVED";

export interface Holder {
  id: string;
  displayCode: string;
  displayName: string;
  legalName: string;
  cik: string | null;
  sourceType: SourceType;
  latestStatus: HolderStatus;
  latestReportPeriod: string | null;
  latestFilingDate: string | null;
  tracked: boolean;
}

export interface Filing {
  id: string;
  holderId: string;
  accessionNumber: string;
  filingType: FilingType;
  reportPeriod: string;
  filedAt: string;
  sourceUrl: string | null;
  isAmendment: boolean;
}

export interface Security {
  id: string;
  ticker: string | null;
  issuerName: string;
  cusip: string;
  exchange: string | null;
  country: string | null;
  themes: string[];
}

export interface Position {
  id: string;
  filingId: string;
  securityId: string;
  shares: number;
  valueUsd: number;
  classTitle: string | null;
  putCall: string | null;
  portfolioWeight: number | null;
}

export interface PositionChange {
  id: string;
  holderId: string;
  currentFilingId: string;
  previousFilingId: string | null;
  securityId: string;
  changeType: ChangeType;
  previousShares: number | null;
  currentShares: number | null;
  sharesDelta: number | null;
  previousValueUsd: number | null;
  currentValueUsd: number | null;
  valueDeltaUsd: number | null;
}

// View models — joined shapes the UI consumes.

export interface HolderListItem {
  id: string;
  displayCode: string;
  displayName: string;
  latestStatus: HolderStatus;
  latestReportPeriod?: string | null;
  category?: string;
  managerName?: string | null;
  managerTitle?: string | null;
}

export interface HoldingRow {
  ticker: string | null;
  issuerName: string;
  cusip: string;
  shares: number;
  valueUsd: number;
  portfolioWeight: number | null;
  firstSeen: string;
  lastReport: string;
  themes: string[];
}

export interface ChangeRow {
  ticker: string | null;
  issuerName: string;
  changeType: ChangeType;
  previousShares: number | null;
  currentShares: number | null;
  sharesDelta: number | null;
  previousValueUsd: number | null;
  currentValueUsd: number | null;
  valueDeltaUsd: number | null;
}

export interface HolderDetail {
  holder: Holder;
  latestFiling: Filing | null;
  totalHoldings: number;
  totalValueUsd: number;
}
