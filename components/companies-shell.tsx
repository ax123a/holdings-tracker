"use client";

import { useState, type ReactNode } from "react";
import {
  ThemeMatrixModal,
  ThemeMatrixSidebar,
  type MatrixCategory,
  type MatrixRow,
} from "@/components/theme-matrix";

export function CompaniesShell({
  header,
  pills,
  table,
  matrixRows,
  matrixCategories,
}: {
  header: ReactNode;
  pills: ReactNode;
  table: ReactNode;
  matrixRows: MatrixRow[];
  matrixCategories: MatrixCategory[];
}) {
  const [showMatrix, setShowMatrix] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasMatrix = matrixRows.length > 0;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className={showMatrix && hasMatrix ? "lg:col-span-3 space-y-3" : "lg:col-span-4 space-y-3"}>
          {header}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">{pills}</div>
            {hasMatrix && !showMatrix ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-sm border border-border bg-muted px-2 py-0.5 text-[11px] font-medium leading-none hover:bg-accent transition-colors"
              >
                View Matrix Summary
              </button>
            ) : null}
          </div>
          {table}
        </div>
        {showMatrix && hasMatrix ? (
          <ThemeMatrixSidebar
            rows={matrixRows}
            categories={matrixCategories}
            onClose={() => setShowMatrix(false)}
            onMaximize={() => setIsModalOpen(true)}
          />
        ) : null}
      </div>
      {isModalOpen ? (
        <ThemeMatrixModal
          rows={matrixRows}
          categories={matrixCategories}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </>
  );
}
