import { HolderList, type ThemeExposure } from "@/components/holder-list";
import { getProvider } from "@/lib/providers";
import { themeLabel } from "@/lib/themes";

export const dynamic = "force-dynamic";

export default async function Page() {
  const provider = getProvider();
  const [holders, companies] = await Promise.all([
    provider.listHolders(),
    provider.listCompanies(),
  ]);

  const categoryByHolder = new Map<string, string>();
  for (const h of holders) categoryByHolder.set(h.id, h.category ?? "Other");

  const counts = new Map<string, Map<string, number>>();
  const stocksByCatTheme = new Map<
    string,
    Map<string, Map<string, { ticker: string | null; issuerName: string }>>
  >();
  for (const c of companies) {
    if (c.security.themes.length === 0) continue;
    for (const owner of c.holders) {
      const cat = categoryByHolder.get(owner.id);
      if (!cat) continue;
      let inner = counts.get(cat);
      if (!inner) {
        inner = new Map();
        counts.set(cat, inner);
      }
      let innerStocks = stocksByCatTheme.get(cat);
      if (!innerStocks) {
        innerStocks = new Map();
        stocksByCatTheme.set(cat, innerStocks);
      }
      for (const t of c.security.themes) {
        inner.set(t, (inner.get(t) ?? 0) + 1);
        let bucket = innerStocks.get(t);
        if (!bucket) {
          bucket = new Map();
          innerStocks.set(t, bucket);
        }
        bucket.set(c.security.id, {
          ticker: c.security.ticker,
          issuerName: c.security.issuerName,
        });
      }
    }
  }

  const exposureByCategory: Record<string, ThemeExposure[]> = {};
  for (const [cat, inner] of counts) {
    const innerStocks = stocksByCatTheme.get(cat);
    exposureByCategory[cat] = Array.from(inner.entries())
      .map(([slug, count]) => ({
        slug,
        label: themeLabel(slug),
        count,
        stocks: Array.from((innerStocks?.get(slug) ?? new Map()).values()).sort(
          (a, b) =>
            (a.ticker ?? a.issuerName).localeCompare(b.ticker ?? b.issuerName),
        ),
      }))
      .sort((a, b) => b.count - a.count);
  }

  return <HolderList holders={holders} exposureByCategory={exposureByCategory} />;
}
