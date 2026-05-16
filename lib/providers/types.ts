import type {
  ChangeRow,
  Filing,
  Holder,
  HolderDetail,
  HolderListItem,
  HoldingRow,
  Security,
} from "@/lib/types";

export interface CompanyRow {
  security: Security;
  holderCount: number;
  totalValueUsd: number;
  holders: { id: string; displayCode: string; displayName: string; valueUsd: number }[];
}

/**
 * Source-agnostic interface for fetching holder data. Swap `MockProvider`
 * for `Sec13FProvider` (or a Prisma-backed store reading persisted SEC data)
 * without touching the UI.
 */
export interface HoldingsProvider {
  readonly name: string;

  listHolders(query?: { search?: string }): Promise<HolderListItem[]>;
  getHolder(id: string): Promise<HolderDetail | null>;
  getHoldings(id: string): Promise<HoldingRow[]>;
  getChanges(id: string): Promise<ChangeRow[]>;
  getFilings(id: string): Promise<Filing[]>;

  listCompanies(query?: { theme?: string; search?: string }): Promise<CompanyRow[]>;

  syncHolder(id: string): Promise<{ ok: true; holder: Holder } | { ok: false; error: string }>;
  syncAll(): Promise<{ synced: number; failed: number }>;
}
