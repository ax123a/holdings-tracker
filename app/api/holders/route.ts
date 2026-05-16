import { NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const search = url.searchParams.get("q") ?? undefined;
  const holders = await getProvider().listHolders({ search });
  return NextResponse.json({ holders });
}

export async function POST(req: Request) {
  // Stub: real impl would persist a new tracked holder. Mock provider has a
  // fixed roster so we just acknowledge.
  const body = await req.json().catch(() => ({}));
  return NextResponse.json(
    { ok: true, received: body, note: "Mock provider does not persist new holders." },
    { status: 202 }
  );
}
