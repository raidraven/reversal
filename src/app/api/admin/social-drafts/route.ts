import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { generateRotationDraft } from "@/lib/socialDraftGenerator";
import { generateDraftToken } from "@/lib/socialDraftTokens";
import { sendSocialDraftGeneratedEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

// 下書き一覧(新しい順、最大50件)
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const drafts = await prisma.socialPostDraft.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ drafts });
}

// 管理画面から手動で今すぐ下書きを1件生成する
export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const result = await generateRotationDraft();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const approveToken = generateDraftToken();
  const draft = await prisma.socialPostDraft.create({
    data: { platform: "x", sourceType: "manual", bodyText: result.bodyText, approveToken },
  });

  await sendSocialDraftGeneratedEmail({
    bodyText: result.bodyText,
    adminUrl: `${SITE_URL}/admin`,
    approveUrl: `${SITE_URL}/api/social-drafts/approve/${approveToken}`,
    rejectUrl: `${SITE_URL}/api/social-drafts/reject/${approveToken}`,
  }).catch((e) => {
    console.error("[admin/social-drafts] 通知メール送信に失敗しました", e);
  });

  return NextResponse.json({ draft });
}
