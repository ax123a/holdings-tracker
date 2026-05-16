import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProvider } from "@/lib/providers";

export async function POST() {
  const result = await getProvider().syncAll();
  revalidatePath("/");
  return NextResponse.json(result);
}
