import { config } from "dotenv";
config();
import { fetchHolderFilings, filingFolderUrl } from "../lib/sec/filings";
import { secFetchText } from "../lib/sec/client";

(async () => {
  const { filings } = await fetchHolderFilings("0001067983", 1);
  const ref = filings[0];
  console.log("Filing ref:", ref.accessionNumber);
  const folder = filingFolderUrl(ref);
  console.log("Folder:", folder);
  const xml = await secFetchText(folder + "primary_doc.xml");
  console.log("XML length:", xml.length);
  console.log("First 2000 chars:");
  console.log(xml.slice(0, 2000));
})();
