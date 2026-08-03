import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRotationDraft } from "@/lib/socialDraftGenerator";
import { generateDraftToken } from "@/lib/socialDraftTokens";
import { sendSocialDraftGeneratedEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/siteUrl";
import { getSocialDraftScheduleTime } from "@/lib/socialDraftSchedule";
import { startOfTodayJst } from "@/lib/date";

export const dynamic = "force-dynamic";

const JST_HHMM_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// GitHub Actionsから15分おきに呼ばれる(Vercel Hobbyプランのcronは1日1回までのため外部スケジューラで代替)。
// 管理画面で設定した時刻(JST)を過ぎていて、かつ今日まだ自動生成していなければ、今日の曜日ローテーションに沿った下書きを1件生成する。
// 実際の投稿は行わない(管理画面から人間が確認して投稿するまでdraftのまま)
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const scheduleTime = await getSocialDraftScheduleTime();
  const nowHHMM = JST_HHMM_FORMATTER.format(new Date());
  if (nowHHMM < scheduleTime) {
    return NextResponse.json({ ok: true, skipped: "before-scheduled-time", scheduleTime, nowHHMM });
  }

  const alreadyGenerated = await prisma.socialPostDraft.findFirst({
    where: { sourceType: "rotation", createdAt: { gte: startOfTodayJst() } },
  });
  if (alreadyGenerated) {
    return NextResponse.json({ ok: true, skipped: "already-generated-today" });
  }

  const result = await generateRotationDraft();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const approveToken = generateDraftToken();
  const draft = await prisma.socialPostDraft.create({
    data: { platform: "x", sourceType: "rotation", bodyText: result.bodyText, approveToken },
  });

  await sendSocialDraftGeneratedEmail({
    bodyText: result.bodyText,
    adminUrl: `${SITE_URL}/admin`,
    approveUrl: `${SITE_URL}/api/social-drafts/approve/${approveToken}`,
    rejectUrl: `${SITE_URL}/api/social-drafts/reject/${approveToken}`,
  }).catch((e) => {
    console.error("[cron/social-draft] 通知メール送信に失敗しました", e);
  });

  return NextResponse.json({ ok: true, draftId: draft.id });
}
