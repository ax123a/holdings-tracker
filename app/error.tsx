"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
      <p className="text-sm font-medium">Something went wrong loading holders.</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Check the server logs and your DATA_PROVIDER configuration.
      </p>
      <Button onClick={reset} size="sm" variant="outline" className="mt-3">
        Retry
      </Button>
    </div>
  );
}
