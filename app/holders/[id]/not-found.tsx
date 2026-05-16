import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-10 text-center">
      <p className="text-sm font-medium">Holder not found</p>
      <p className="mt-1 text-xs text-muted-foreground">
        It may have been removed or never tracked.
      </p>
      <Link
        href="/"
        className="mt-3 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to all holders
      </Link>
    </div>
  );
}
