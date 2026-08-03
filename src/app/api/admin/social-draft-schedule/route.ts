import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  getSocialDraftScheduleTime,
  setSocialDraftScheduleTime,
  isValidScheduleTime,
} from "@/lib/socialDraftSchedule";

export const dynamic = "force-dynamic";

// X投稿下書きの自動生成時刻(JST)の取得
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const scheduleTime = await getSocialDraftScheduleTime();
  return NextResponse.json({ scheduleTime });
}

// X投稿下書きの自動生成時刻(JST)の変更
export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const scheduleTime = body?.scheduleTime;
  if (typeof scheduleTime !== "string" || !isValidScheduleTime(scheduleTime)) {
    return NextResponse.json({ error: "時刻はHH:MM形式で指定してください" }, { status: 400 });
  }

  await setSocialDraftScheduleTime(scheduleTime);
  return NextResponse.json({ scheduleTime });
}
