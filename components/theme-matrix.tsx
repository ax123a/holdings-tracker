"use client";

import { formatUsd } from "@/lib/utils";

export type MatrixRow = {
  slug: string;
  label: string;
  total: number;
  byCat: Record<string, number>;
};

export type MatrixCategory = { key: string; short: string };

export function ThemeMatrixTable({
  rows,
  categories,
  compact = true,
}: {
  rows: MatrixRow[];
  categories: MatrixCategory[];
  compact?: boolean;
}) {
  const cellSize = compact ? "text-[12px]" : "text-sm";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <th className="py-1 pr-2 text-left font-medium">Theme</th>
            <th className="py-1 px-1 text-right font-medium">Total</th>
            {categories.map((c) => (
              <th
                key={c.key}
                title={c.key}
                className="py-1 px-1 text-right font-medium"
              >
                {c.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} className="border-b border-border/50 last:border-0">
              <td className={`py-1 pr-2 ${cellSize}`}>{r.label}</td>
              <td className={`py-1 px-1 text-right font-semibold num ${cellSize}`}>
                {formatUsd(r.total)}
              </td>
              {categories.map((c) => (
                <td
                  key={c.key}
                  className={`py-1 px-1 text-right num text-muted-foreground ${cellSize}`}
                >
                  {r.byCat[c.key] ? formatUsd(r.byCat[c.key]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ThemeMatrixSidebar({
  rows,
  categories,
  onClose,
  onMaximize,
}: {
  rows: MatrixRow[];
  categories: MatrixCategory[];
  onClose: () => void;
  onMaximize: () => void;
}) {
  if (rows.length === 0) return null;
  return (
    <aside className="lg:col-span-1 lg:sticky lg:top-20">
      <div className="bg-card border rounded-lg p-4 shadow-sm relative">
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Expand matrix"
            onClick={onMaximize}
            className="text-muted-foreground hover:text-foreground"
          >
            ⤢
          </button>
          <button
            type="button"
            aria-label="Close matrix"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
        <div className="mb-3 pr-12">
          <h3 className="text-sm font-semibold leading-tight">Themes Matrix</h3>
          <p className="text-[11px] text-muted-foreground">
            Reported value by theme across filer groups
          </p>
        </div>
        <ThemeMatrixTable rows={rows} categories={categories} compact />
      </div>
    </aside>
  );
}

export function ThemeMatrixModal({
  rows,
  categories,
  onClose,
}: {
  rows: MatrixRow[];
  categories: MatrixCategory[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-lg p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
        <div className="mb-4 pr-6">
          <h3 className="text-base font-semibold leading-tight">Themes Matrix</h3>
          <p className="text-xs text-muted-foreground">
            Reported value by theme across filer groups
          </p>
        </div>
        <ThemeMatrixTable rows={rows} categories={categories} compact={false} />
      </div>
    </div>
  );
}
