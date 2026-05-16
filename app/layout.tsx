import type { Metadata } from "next";
import { DemoBanner, LiveBanner } from "@/components/demo-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holdings Tracker",
  description: "Track public stock holdings disclosed by 13F institutional filers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const provider = (process.env.DATA_PROVIDER ?? "mock").toLowerCase();
  const isDemo = provider !== "sec13f";

  return (
    <html lang="en">
      <body suppressHydrationWarning className="min-h-dvh bg-background text-foreground antialiased">
        {isDemo ? <DemoBanner /> : <LiveBanner />}
        <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:py-6">
          <header className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-baseline gap-4">
              <a href="/" className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tracking-tight">Holdings Tracker</span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  13F board
                </span>
              </a>
              <nav className="flex items-baseline gap-3 text-xs text-muted-foreground">
                <a href="/" className="hover:text-foreground">Holders</a>
                <a href="/companies" className="hover:text-foreground">Companies</a>
              </nav>
            </div>
            <span
              className={
                isDemo
                  ? "rounded-sm border border-warning/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  : "rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              }
              style={isDemo ? { color: "hsl(var(--warning))" } : undefined}
            >
              {isDemo ? "LOCAL 13F · DEMO" : "SEC EDGAR · LIVE"}
            </span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
