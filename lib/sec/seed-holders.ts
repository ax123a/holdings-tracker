// Tracked 13F filers for live mode.
// CIKs are public SEC registry facts, verified against EDGAR search index.
// Keep this list manageable — sync.ts iterates it. More can be added later.

export type SeedHolder = {
  cik: string;            // 10-digit padded
  displayCode: string;    // short ID for UI lists
  displayName: string;    // human-friendly
  category: string;       // grouping for dashboard display
};

export const SEED_HOLDERS: SeedHolder[] = [
  // ── Elite Hedge Funds ──
  { cik: "0001067983", displayCode: "BRK",   displayName: "Berkshire Hathaway",        category: "Elite Hedge Funds" },
  { cik: "0001350694", displayCode: "BRDG",  displayName: "Bridgewater Associates",    category: "Elite Hedge Funds" },
  { cik: "0001037389", displayCode: "REN",   displayName: "Renaissance Technologies",  category: "Elite Hedge Funds" },
  { cik: "0001423053", displayCode: "CIT",   displayName: "Citadel Advisors",          category: "Elite Hedge Funds" },
  { cik: "0001336528", displayCode: "PERS",  displayName: "Pershing Square Capital",   category: "Elite Hedge Funds" },
  { cik: "0001179392", displayCode: "2SIG",  displayName: "Two Sigma Investments",     category: "Elite Hedge Funds" },
  { cik: "0001103804", displayCode: "VIK",   displayName: "Viking Global",             category: "Elite Hedge Funds" },
  { cik: "0001061165", displayCode: "LONP",  displayName: "Lone Pine Capital",         category: "Elite Hedge Funds" },
  { cik: "0001061768", displayCode: "BAUP",  displayName: "Baupost Group",             category: "Elite Hedge Funds" },
  { cik: "0001747057", displayCode: "D1",    displayName: "D1 Capital Partners",       category: "Elite Hedge Funds" },
  { cik: "0000934639", displayCode: "MAV",   displayName: "Maverick Capital",          category: "Elite Hedge Funds" },

  // ── AI & Technology ──
  { cik: "0001167483", displayCode: "TIGR",  displayName: "Tiger Global Mgmt",         category: "AI & Technology" },
  { cik: "0001135730", displayCode: "COAT",  displayName: "Coatue Management",         category: "AI & Technology" },
  { cik: "0001697748", displayCode: "ARK",   displayName: "ARK Investment Mgmt",       category: "AI & Technology" },
  { cik: "0001602189", displayCode: "DRAG",  displayName: "Dragoneer Investment Group", category: "AI & Technology" },
  { cik: "0001541617", displayCode: "ALTM",  displayName: "Altimeter Capital Mgmt",    category: "AI & Technology" },
  { cik: "0001798849", displayCode: "DURB",  displayName: "Durable Capital Partners",  category: "AI & Technology" },
  { cik: "0001387322", displayCode: "WHLR",  displayName: "Whale Rock Capital Mgmt",   category: "AI & Technology" },
  { cik: "0001569049", displayCode: "LST",   displayName: "Light Street Capital",      category: "AI & Technology" },
  { cik: "0001844008", displayCode: "STDV",  displayName: "Steadview Capital Mgmt",    category: "AI & Technology" },

  // ── Mega Asset Managers ──
  { cik: "0001569709", displayCode: "ICNQ",  displayName: "ICONIQ Capital",            category: "Mega Asset Managers" },
  { cik: "0001230239", displayCode: "ALKN",  displayName: "Alkeon Capital Management", category: "Mega Asset Managers" },
  { cik: "0001697233", displayCode: "GQG",   displayName: "GQG Partners",              category: "Mega Asset Managers" },
  { cik: "0001020066", displayCode: "SAND",  displayName: "Sands Capital Management",  category: "Mega Asset Managers" },
  { cik: "0001088875", displayCode: "BG",    displayName: "Baillie Gifford",           category: "Mega Asset Managers" },

  // ── Public Pension Funds ──
  { cik: "0000919079", displayCode: "CALPERS", displayName: "CalPERS",                 category: "Public Pension Funds" },
];

// Ordered list of categories for display.
export const HOLDER_CATEGORIES = [
  "Elite Hedge Funds",
  "AI & Technology",
  "Mega Asset Managers",
  "Public Pension Funds",
] as const;

// CIK → category lookup (used by the provider to attach category to holder list items).
export const CIK_CATEGORY_MAP = new Map<string, string>(
  SEED_HOLDERS.map((h) => [h.cik, h.category]),
);
