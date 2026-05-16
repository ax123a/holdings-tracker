import { NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await getProvider().getChanges(id);
  return NextResponse.json({ changes });
}
