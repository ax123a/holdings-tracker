// 13F-HR InformationTable XML parser.
//
// SEC publishes two XML docs per 13F filing:
//   - primary_doc.xml       (cover page, filer info)
//   - {something}.xml       (informationTable: the actual holdings)
//
// The information-table file's name varies by filer. We discover it from the
// filing folder index and parse out one entry per (cusip, classTitle, putCall).

import { XMLParser } from "fast-xml-parser";
import { secFetchText } from "./client";
import { filingFolderUrl, type FilingRef } from "./filings";

export type Holding = {
  nameOfIssuer: string;
  titleOfClass: string;          // typically "COM"
  cusip: string;
  value: number;                 // USD (post-2022 SEC reporting is in actual dollars)
  shares: number;
  shareType: string;             // "SH" or "PRN"
  putCall: string | null;        // "Put" | "Call" | null
  investmentDiscretion: string | null;
};

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  parseTagValue: false,           // keep CUSIPs / share counts as strings
  trimValues: true,
});

// Find the information table file URL inside a filing folder by reading its
// JSON index. The folder URL + "index.json" gives us all files.
async function findInfoTableUrl(ref: FilingRef): Promise<string> {
  const folder = filingFolderUrl(ref);
  const idx = await secFetchText(`${folder}index.json`);
  const data = JSON.parse(idx) as { directory?: { item?: { name: string }[] } };
  const items = data.directory?.item ?? [];
  // Heuristic: the information table is the .xml file that's NOT primary_doc.xml.
  // Some filers use "form13fInfoTable.xml", some "infotable.xml", etc.
  const infoTable = items.find((it) => {
    const n = it.name.toLowerCase();
    return n.endsWith(".xml") && n !== "primary_doc.xml" && !n.includes("primary_doc");
  });
  if (!infoTable) {
    throw new Error(`No information table XML found in ${folder}`);
  }
  return `${folder}${infoTable.name}`;
}

function toNumber(s: string | number | undefined | null): number {
  if (s == null) return 0;
  const n = typeof s === "number" ? s : parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export type SignatoryInfo = {
  name: string | null;
  title: string | null;
};

export async function parseSignatory(ref: FilingRef): Promise<SignatoryInfo> {
  const folder = filingFolderUrl(ref);
  try {
    const xml = await secFetchText(`${folder}primary_doc.xml`);
    const parsed = xmlParser.parse(xml);
    const root = parsed.edgarSubmission ?? parsed;
    const formData = root?.formData ?? root?.FormData ?? root;
    const sigBlock = formData?.signatureBlock ?? formData?.SignatureBlock;
    if (!sigBlock) return { name: null, title: null };
    const name = sigBlock.name ?? sigBlock.Name;
    const title = sigBlock.title ?? sigBlock.Title;
    return {
      name: name ? String(name).trim() : null,
      title: title ? String(title).trim() : null,
    };
  } catch {
    return { name: null, title: null };
  }
}

export async function parseInformationTable(ref: FilingRef): Promise<Holding[]> {
  const url = await findInfoTableUrl(ref);
  const xml = await secFetchText(url);
  const parsed = xmlParser.parse(xml);

  // Root could be <informationTable> or namespaced; removeNSPrefix=true normalizes.
  const root = parsed.informationTable ?? parsed.InformationTable ?? parsed;
  let entries = root?.infoTable ?? root?.InfoTable;
  if (!entries) return [];
  if (!Array.isArray(entries)) entries = [entries];

  const out: Holding[] = [];
  for (const e of entries) {
    if (!e) continue;
    const cusip = String(e.cusip ?? "").trim().toUpperCase();
    if (!cusip) continue;
    const sharesNode = e.shrsOrPrnAmt ?? {};
    out.push({
      nameOfIssuer: String(e.nameOfIssuer ?? "").trim() || "(unknown issuer)",
      titleOfClass: String(e.titleOfClass ?? "COM").trim() || "COM",
      cusip,
      value: toNumber(e.value),
      shares: toNumber(sharesNode.sshPrnamt),
      shareType: String(sharesNode.sshPrnamtType ?? "SH").trim().toUpperCase(),
      putCall: e.putCall ? String(e.putCall).trim() : null,
      investmentDiscretion: e.investmentDiscretion
        ? String(e.investmentDiscretion).trim()
        : null,
    });
  }
  return out;
}
