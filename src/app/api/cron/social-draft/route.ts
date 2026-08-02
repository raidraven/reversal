import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRotationDraft } from "@/lib/socialDraftGenerator";

export const dynamic = "force-dynamic";

// Vercel Cronから毎日呼ばれ、今日の曜日ローテーションに沿った下書きを1件生成する。
// 実際の投稿は行わない(管理画面から人間が確認して投稿するまでdraftのまま)
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await generateRotationDraft();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const draft = await prisma.socialPostDraft.create({
    data: { platform: "x", sourceType: "rotation", bodyText: result.bodyText },
  });

  return NextResponse.json({ ok: true, draftId: draft.id });
}
