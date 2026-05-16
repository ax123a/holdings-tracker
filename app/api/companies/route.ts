import { NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const theme = url.searchParams.get("theme") ?? undefined;
  const search = url.searchParams.get("q") ?? undefined;
  const companies = await getProvider().listCompanies({ theme, search });
  return NextResponse.json({ companies });
}
