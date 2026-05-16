// SEC EDGAR submission index → 13F-HR filing list.
//
// Endpoint: https://data.sec.gov/submissions/CIK{padded}.json
// Returns recent filings; we filter to 13F-HR / 13F-HR/A and resolve each
// accession number to its filing index URL.

import { padCik, secFetchJson } from "./client";

export type FilingRef = {
  accessionNumber: string;     // "0001067983-25-000004"
  accessionDashless: string;   // "000106798325000004"
  filingType: "13F-HR" | "13F-HR/A";
  reportPeriod: string;        // "2025-09-30"
  filedAt: string;             // "2025-11-14"
  primaryDoc: string;          // "primary_doc.xml"
  cik: string;                 // padded
};

type SubmissionsJson = {
  cik: string;
  name: string;
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      form: string[];
      primaryDocument: string[];
      isXBRL: number[];
    };
  };
};

export async function fetchHolderFilings(cik: string, limit = 4): Promise<{ name: string; filings: FilingRef[] }> {
  const padded = padCik(cik);
  const url = `https://data.sec.gov/submissions/CIK${padded}.json`;
  const data = await secFetchJson<SubmissionsJson>(url);
  const recent = data.filings?.recent;
  if (!recent) return { name: data.name ?? "", filings: [] };

  const out: FilingRef[] = [];
  for (let i = 0; i < recent.form.length; i++) {
    const form = recent.form[i];
    if (form !== "13F-HR" && form !== "13F-HR/A") continue;
    out.push({
      accessionNumber: recent.accessionNumber[i],
      accessionDashless: recent.accessionNumber[i].replace(/-/g, ""),
      filingType: form as "13F-HR" | "13F-HR/A",
      reportPeriod: recent.reportDate[i],
      filedAt: recent.filingDate[i],
      primaryDoc: recent.primaryDocument[i],
      cik: padded,
    });
    if (out.length >= limit) break;
  }
  return { name: data.name ?? "", filings: out };
}

export function filingIndexUrl(ref: FilingRef): string {
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ref.cik}&type=13F&action=getcompany`;
}

export function filingFolderUrl(ref: FilingRef): string {
  // e.g. https://www.sec.gov/Archives/edgar/data/1067983/000095012325014557/
  const cikInt = String(parseInt(ref.cik, 10));
  return `https://www.sec.gov/Archives/edgar/data/${cikInt}/${ref.accessionDashless}/`;
}
