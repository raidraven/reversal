import { NextResponse } from "next/server";
import { getSiteTexts } from "@/lib/siteText";

export const dynamic = "force-dynamic";

// サイト全体の文言・アイコン(公開・誰でも閲覧可)
export async function GET() {
  const texts = await getSiteTexts();
  return NextResponse.json({ texts });
}
