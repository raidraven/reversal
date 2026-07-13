import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateDailyGreeting } from "@/lib/companion";
import { parseEmotionText } from "@/lib/companionEmotion";

export const dynamic = "force-dynamic";

// その日初回のみAIが挨拶を生成(2回目以降は当日の挨拶を返す)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    const raw = await getOrCreateDailyGreeting(session.user.id);
    // 保存された挨拶には感情タグ(《happy》等)が含まれるため、分離して返す
    const { emotion, text } = parseEmotionText(raw);
    return NextResponse.json({ greeting: text, emotion });
  } catch (e) {
    console.error("greeting error:", e);
    return NextResponse.json({ error: "挨拶の取得に失敗しました" }, { status: 500 });
  }
}
