import { NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const holdings = await getProvider().getHoldings(id);
  return NextResponse.json({ holdings });
}
