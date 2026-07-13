import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { submitAnswer } from "@/lib/qna";

const bodySchema = z.object({
  content: z.string().min(1, "回答を入力してください").max(1000, "1000文字以内で入力してください"),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  try {
    const result = await submitAnswer(session.user.id, params.id, parsed.data.content.trim());
    if (!result.ok) {
      if (result.reason === "not_found") {
        return NextResponse.json({ error: "問いが見つかりません" }, { status: 404 });
      }
      if (result.reason === "rejected") {
        return NextResponse.json({ error: result.message }, { status: 422 });
      }
      if (result.reason === "banned") {
        return NextResponse.json({ error: result.message }, { status: 403 });
      }
      return NextResponse.json({ error: "この問いには既に回答済みです" }, { status: 409 });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error("answer submit error:", e);
    return NextResponse.json(
      { error: "処理に失敗しました。時間をおいて再度お試しください" },
      { status: 500 }
    );
  }
}
