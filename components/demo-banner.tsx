export function DemoBanner() {
  return (
    <div
      role="note"
      className="border-b border-warning/40 bg-warning/10 px-3 py-1.5 text-[12px] leading-snug text-warning-foreground"
      style={{ color: "hsl(var(--warning))" }}
    >
      <strong className="font-semibold">LOCAL 13F DATASET — NOT LIVE.</strong>{" "}
      <span className="text-foreground/80">
        Holder names and CIKs are real public SEC registry facts; tickers and
        CUSIPs are real market identifiers. Share counts, market values,
        portfolio weights, accession numbers, and the specific holder→security
        pairings are <em>synthetic</em>, shaped by each manager's known
        strategy. To switch to live data, set{" "}
        <code className="font-mono text-[11px]">DATA_PROVIDER=sec13f</code> and
        run <code className="font-mono text-[11px]">npm run sync -- --all</code>.
      </span>
    </div>
  );
}

export function LiveBanner() {
  return (
    <div
      role="note"
      className="border-b border-border/60 bg-muted/40 px-3 py-1.5 text-[12px] leading-snug"
    >
      <strong className="font-semibold">Institutional holders · SEC 13F.</strong>{" "}
      <span className="text-muted-foreground">
        13F filings are quarterly and reported with a ~45-day lag — values reflect
        the holder's <em>latest available</em> snapshot, not real-time positions.
        Refresh with <code className="font-mono text-[11px]">npm run sync -- --all</code>.
      </span>
    </div>
  );
}
