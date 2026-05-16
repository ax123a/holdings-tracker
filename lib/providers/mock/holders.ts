// LOCAL 13F DATASET — institutional holder universe.
// Holder legal names + CIKs are real public registry facts.
// Strategy bias is hand-assigned to drive plausible holdings selection in the
// generator; it does not reflect any specific filing.

import { SEC_BY_ID } from "./securities";

export type Strategy =
  | "value-concentrated"
  | "value-quality"
  | "value"
  | "value-event"
  | "macro"
  | "quant-broad"
  | "hedge-multi"
  | "growth-tech"
  | "growth-value"
  | "activist"
  | "healthcare"
  | "healthcare-growth"
  | "passive-giant"
  | "large-active"
  | "sovereign"
  | "alternatives"
  | "innovation";

export const STRATEGY_BIAS: Record<Strategy, Record<string, number>> = {
  "value-concentrated":   { finance: 5, consumer: 5, energy: 4, health: 2, industrial: 2 },
  "value-quality":        { finance: 4, consumer: 5, health: 4, industrial: 3, comms: 2 },
  "value":                { finance: 5, energy: 4, consumer: 3, industrial: 3, health: 2, auto: 2 },
  "value-event":          { finance: 4, consumer: 3, comms: 3, energy: 2, health: 3, industrial: 2 },
  "macro":                { finance: 4, energy: 4, consumer: 3, health: 3, comms: 2, industrial: 2, ai: 2, semi: 2 },
  "quant-broad":          { ai: 4, semi: 4, cloud: 4, consumer: 4, finance: 4, health: 3, energy: 3, industrial: 3, comms: 3, auto: 2, space: 2, defense: 2 },
  "hedge-multi":          { ai: 4, semi: 3, cloud: 3, finance: 3, consumer: 3, energy: 3, health: 3, industrial: 2 },
  "growth-tech":          { ai: 6, cloud: 6, semi: 4, comms: 3, consumer: 2, space: 2 },
  "growth-value":         { ai: 3, cloud: 3, consumer: 4, finance: 3, health: 3, comms: 2 },
  "activist":             { consumer: 4, comms: 4, finance: 3, industrial: 3 },
  "healthcare":           { health: 8 },
  "healthcare-growth":    { health: 6, ai: 2, cloud: 2 },
  "passive-giant":        { ai: 3, semi: 3, cloud: 3, finance: 3, consumer: 3, health: 3, energy: 3, industrial: 3, comms: 3, auto: 2, space: 1, defense: 2 },
  "large-active":         { ai: 4, cloud: 4, semi: 3, consumer: 3, health: 3, finance: 3, industrial: 2, comms: 2, energy: 2, space: 1, defense: 2 },
  "sovereign":            { ai: 3, semi: 3, cloud: 3, finance: 4, consumer: 3, health: 3, energy: 4, industrial: 3, comms: 3, auto: 2 },
  "alternatives":         { finance: 5, energy: 4, industrial: 3, consumer: 3, comms: 2, health: 2 },
  "innovation":           { ai: 6, space: 5, cloud: 4, semi: 3, auto: 2, health: 2 },
};

export type HolderDef = {
  id: string;
  code: string;
  name: string;
  legal: string;
  cik: string | null;
  strategy: Strategy;
  targetSize: number;
};

export const HOLDER_DEFS: HolderDef[] = [
  // Value-concentrated / classics
  { id: "h-brk",   code: "BRK",   name: "Berkshire Hathaway",            legal: "Berkshire Hathaway Inc.",                cik: "0001067983", strategy: "value-concentrated", targetSize: 12 },
  { id: "h-baup",  code: "BAUP",  name: "Baupost Group",                 legal: "The Baupost Group, L.L.C.",              cik: "0001061768", strategy: "value-event",        targetSize: 22 },
  { id: "h-ruane", code: "RUANE", name: "Ruane Cunniff (Sequoia Fund)",  legal: "Ruane Cunniff & Goldfarb L.P.",          cik: "0001008437", strategy: "value-concentrated", targetSize: 14 },
  { id: "h-yack",  code: "YACK",  name: "Yacktman Asset Mgmt",           legal: "Yacktman Asset Management LP",           cik: "0000905567", strategy: "value-quality",      targetSize: 28 },
  { id: "h-akre",  code: "AKRE",  name: "Akre Capital Mgmt",             legal: "Akre Capital Management, LLC",           cik: "0001112520", strategy: "value-quality",      targetSize: 18 },
  { id: "h-dcox",  code: "DCOX",  name: "Dodge & Cox",                   legal: "Dodge & Cox",                            cik: "0000200217", strategy: "value-quality",      targetSize: 50 },
  { id: "h-hotc",  code: "HOTC",  name: "Hotchkis & Wiley Capital Mgmt", legal: "Hotchkis & Wiley Capital Management LLC", cik: "0001282202", strategy: "value",             targetSize: 45 },
  { id: "h-pzena", code: "PZENA", name: "Pzena Investment Mgmt",         legal: "Pzena Investment Management LLC",        cik: "0001137774", strategy: "value",              targetSize: 55 },
  { id: "h-gmo",   code: "GMO",   name: "GMO LLC",                       legal: "Grantham, Mayo, Van Otterloo & Co. LLC", cik: "0000900092", strategy: "value-quality",      targetSize: 60 },

  // Macro / event
  { id: "h-brdg",  code: "BRDG",  name: "Bridgewater Associates",        legal: "Bridgewater Associates, LP",             cik: "0001350694", strategy: "macro",              targetSize: 55 },
  { id: "h-appa",  code: "APPA",  name: "Appaloosa Management",          legal: "Appaloosa LP",                           cik: "0001656456", strategy: "value-event",        targetSize: 28 },
  { id: "h-grlt",  code: "GRLT",  name: "Greenlight Capital",            legal: "Greenlight Capital, Inc.",               cik: "0001479844", strategy: "value-event",        targetSize: 30 },

  // Quant / systematic
  { id: "h-ren",   code: "REN",   name: "Renaissance Technologies",      legal: "Renaissance Technologies LLC",           cik: "0001037389", strategy: "quant-broad",        targetSize: 80 },
  { id: "h-2sig",  code: "2SIG",  name: "Two Sigma Investments",         legal: "Two Sigma Investments, LP",              cik: "0001179392", strategy: "quant-broad",        targetSize: 85 },
  { id: "h-desh",  code: "DESH",  name: "D. E. Shaw & Co.",              legal: "D. E. Shaw & Co., L.P.",                 cik: "0001009207", strategy: "quant-broad",        targetSize: 80 },
  { id: "h-aqr",   code: "AQR",   name: "AQR Capital Mgmt",              legal: "AQR Capital Management LLC",             cik: "0001167557", strategy: "quant-broad",        targetSize: 70 },
  { id: "h-man",   code: "MAN",   name: "Man Group",                     legal: "Man Group plc",                          cik: "0000919574", strategy: "quant-broad",        targetSize: 55 },
  { id: "h-mw",    code: "MW",    name: "Marshall Wace",                 legal: "Marshall Wace North America L.P.",       cik: "0001719607", strategy: "quant-broad",        targetSize: 65 },

  // Multi-strategy hedge
  { id: "h-cit",   code: "CIT",   name: "Citadel Advisors",              legal: "Citadel Advisors LLC",                   cik: "0001423053", strategy: "hedge-multi",        targetSize: 90 },
  { id: "h-mlp",   code: "MLP",   name: "Millennium Mgmt",               legal: "Millennium Management LLC",              cik: "0001273087", strategy: "hedge-multi",        targetSize: 90 },
  { id: "h-pt72",  code: "PT72",  name: "Point72 Asset Mgmt",            legal: "Point72 Asset Management, L.P.",         cik: "0001603466", strategy: "hedge-multi",        targetSize: 60 },
  { id: "h-baly",  code: "BALY",  name: "Balyasny Asset Mgmt",           legal: "Balyasny Asset Management L.P.",         cik: "0001601994", strategy: "hedge-multi",        targetSize: 60 },

  // Growth / tech-tilt
  { id: "h-tigr",  code: "TIGR",  name: "Tiger Global Mgmt",             legal: "Tiger Global Management LLC",            cik: "0001167483", strategy: "growth-tech",        targetSize: 30 },
  { id: "h-coat",  code: "COAT",  name: "Coatue Management",             legal: "Coatue Management, L.L.C.",              cik: "0001135730", strategy: "growth-tech",        targetSize: 32 },
  { id: "h-whlr",  code: "WHLR",  name: "Whale Rock Capital",            legal: "Whale Rock Capital Management LLC",      cik: "0001559771", strategy: "growth-tech",        targetSize: 25 },
  { id: "h-lst",   code: "LST",   name: "Light Street Capital",          legal: "Light Street Capital Management, LLC",   cik: "0001541617", strategy: "growth-tech",        targetSize: 22 },
  { id: "h-lonp",  code: "LONP",  name: "Lone Pine Capital",             legal: "Lone Pine Capital LLC",                  cik: "0001061165", strategy: "growth-tech",        targetSize: 26 },
  { id: "h-mav",   code: "MAV",   name: "Maverick Capital",              legal: "Maverick Capital, Ltd.",                 cik: "0000905949", strategy: "growth-tech",        targetSize: 35 },
  { id: "h-ark",   code: "ARK",   name: "ARK Investment Mgmt",           legal: "ARK Investment Management LLC",          cik: "0001697748", strategy: "innovation",         targetSize: 30 },
  { id: "h-bg",    code: "BG",    name: "Baillie Gifford",               legal: "Baillie Gifford & Co.",                  cik: "0001274167", strategy: "growth-tech",        targetSize: 60 },

  // Activist
  { id: "h-pers",  code: "PERS",  name: "Pershing Square Capital",       legal: "Pershing Square Capital Management, L.P.", cik: "0001336528", strategy: "activist",         targetSize: 8 },
  { id: "h-tpnt",  code: "TPNT",  name: "Third Point",                   legal: "Third Point LLC",                        cik: "0001040273", strategy: "activist",           targetSize: 20 },
  { id: "h-elli",  code: "ELLI",  name: "Elliott Investment Mgmt",       legal: "Elliott Investment Management L.P.",     cik: "0001791786", strategy: "activist",           targetSize: 18 },
  { id: "h-tria",  code: "TRIA",  name: "Trian Fund Mgmt",               legal: "Trian Fund Management, L.P.",            cik: "0001345471", strategy: "activist",           targetSize: 10 },

  // Healthcare specialists
  { id: "h-vik",   code: "VIK",   name: "Viking Global",                 legal: "Viking Global Investors LP",             cik: "0001103804", strategy: "healthcare-growth",  targetSize: 35 },
  { id: "h-perc",  code: "PERC",  name: "Perceptive Advisors",           legal: "Perceptive Advisors LLC",                cik: "0001224962", strategy: "healthcare",         targetSize: 30 },
  { id: "h-racap", code: "RACAP", name: "RA Capital Mgmt",               legal: "RA Capital Management, L.P.",            cik: "0001346824", strategy: "healthcare",         targetSize: 25 },
  { id: "h-bakr",  code: "BAKR",  name: "Baker Bros. Advisors",          legal: "Baker Bros. Advisors LP",                cik: "0001263508", strategy: "healthcare",         targetSize: 28 },

  // Index giants / large active
  { id: "h-vg",    code: "VG",    name: "Vanguard Group",                legal: "The Vanguard Group, Inc.",               cik: "0000102909", strategy: "passive-giant",      targetSize: 110 },
  { id: "h-blki",  code: "BLKI",  name: "BlackRock",                     legal: "BlackRock, Inc.",                        cik: "0001364742", strategy: "passive-giant",      targetSize: 110 },
  { id: "h-stt",   code: "STT",   name: "State Street Global Advisors",  legal: "State Street Corporation",               cik: "0000093751", strategy: "passive-giant",      targetSize: 100 },
  { id: "h-fmr",   code: "FMR",   name: "Fidelity (FMR)",                legal: "FMR LLC",                                cik: "0000315066", strategy: "large-active",       targetSize: 85 },
  { id: "h-trp",   code: "TRP",   name: "T. Rowe Price",                 legal: "T. Rowe Price Associates, Inc.",         cik: "0000080255", strategy: "large-active",       targetSize: 75 },
  { id: "h-wlg",   code: "WLG",   name: "Wellington Mgmt",               legal: "Wellington Management Company LLP",      cik: "0000902219", strategy: "large-active",       targetSize: 80 },
  { id: "h-capr",  code: "CAPR",  name: "Capital Research (Capital Group)", legal: "Capital Research Global Investors",  cik: "0001144146", strategy: "large-active",       targetSize: 70 },
  { id: "h-geode", code: "GEODE", name: "Geode Capital Mgmt",            legal: "Geode Capital Management, LLC",          cik: "0001364933", strategy: "passive-giant",      targetSize: 95 },

  // Sovereigns
  { id: "h-norg",  code: "NORG",  name: "Norges Bank Investment Mgmt",   legal: "Norges Bank",                            cik: "0001262044", strategy: "sovereign",          targetSize: 90 },
  { id: "h-gic",   code: "GIC",   name: "GIC (Singapore)",               legal: "GIC Private Limited",                    cik: "0001543160", strategy: "sovereign",          targetSize: 70 },

  // Alternatives
  { id: "h-bx",    code: "BX",    name: "Blackstone (institutional)",    legal: "Blackstone Inc.",                        cik: "0001393818", strategy: "alternatives",       targetSize: 25 },
  { id: "h-kkr",   code: "KKR",   name: "KKR & Co.",                     legal: "KKR & Co. Inc.",                         cik: "0001404912", strategy: "alternatives",       targetSize: 25 },

  // Empty placeholder for UI coverage of "no filings yet" state
  { id: "h-empty", code: "NEWCO", name: "Newly Tracked Fund",            legal: "Newly Tracked Fund LP",                  cik: null,         strategy: "large-active",       targetSize: 0 },
];

// Hand-curated plausible top holdings for very well-known concentrated holders.
// Quantities are still synthetic; this only steers which securities are picked.
export const CONCENTRATED: Record<string, string[]> = {
  "h-brk":   ["s-aapl","s-bac","s-ko","s-axp","s-cvx","s-oxy","s-v","s-ma","s-cost","s-jpm","s-mco","s-kkr"],
  "h-pers":  ["s-cmg","s-qsr","s-hlt","s-googl","s-cp","s-uber","s-now","s-hd"],
  "h-ruane": ["s-googl","s-meta","s-tsm","s-jpm","s-uber","s-mco","s-axp","s-cmg","s-net","s-now","s-eog","s-de","s-blk","s-v"],
  "h-ark":   ["s-tsla","s-rklb","s-asts","s-pltr","s-pl","s-spir","s-irdm","s-ionq","s-path","s-soun","s-bbai","s-ai","s-snow","s-mdb","s-net","s-crwd","s-amd","s-tsm","s-mrna","s-rivn","s-lcid"],
  "h-tria":  ["s-dis","s-ge","s-aapl","s-pep","s-wfc","s-pg","s-cmcsa","s-jnj","s-mco","s-v"],
};

// Filter concentrated lists down to ids that actually exist in the security universe.
for (const id of Object.keys(CONCENTRATED)) {
  CONCENTRATED[id] = CONCENTRATED[id].filter((sid) => SEC_BY_ID.has(sid));
}
