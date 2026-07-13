import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { completeMission } from "@/lib/game";

const bodySchema = z.object({
  missionId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
  }

  try {
    const result = await completeMission(session.user.id, parsed.data.missionId);

    if (!result.ok) {
      if (result.reason === "banned") {
        return NextResponse.json(
          { error: "このアカウントは通報により利用停止されています" },
          { status: 403 }
        );
      }
      if (result.reason === "not_found" || result.reason === "not_today") {
        return NextResponse.json(
          { error: "そのミッションは今宵の使命ではありません" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: "本日は既に完了しています" }, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("mission complete error:", e);
    return NextResponse.json(
      { error: "処理に失敗しました。時間をおいて再度お試しください" },
      { status: 500 }
    );
  }
}
