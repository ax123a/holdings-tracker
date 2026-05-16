import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProvider } from "@/lib/providers";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProvider().syncHolder(id);

  // Refresh both list and detail views regardless of provider outcome.
  revalidatePath("/");
  revalidatePath(`/holders/${id}`);

  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
