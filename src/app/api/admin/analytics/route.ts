import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getGa4Summary } from "@/lib/ga4";

export const dynamic = "force-dynamic";

// GA4の直近28日間サマリーを取得(管理ページ表示用)
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const summary = await getGa4Summary();
    if (!summary) {
      return NextResponse.json(
        { error: "GA4連携が未設定です(.env.exampleのGA4_PROPERTY_ID/GA4_SERVICE_ACCOUNT_JSON_BASE64を参照)" },
        { status: 501 },
      );
    }
    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json({ error: `GA4取得エラー: ${message}` }, { status: 502 });
  }
}
