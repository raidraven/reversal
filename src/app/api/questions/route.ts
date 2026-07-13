import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createQuestion } from "@/lib/qna";

const bodySchema = z.object({
  content: z.string().min(1, "質問内容を入力してください").max(500, "500文字以内で入力してください"),
});

export async function POST(req: Request) {
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

  const result = await createQuestion(session.user.id, parsed.data.content.trim());
  if (!result.ok) {
    const status = result.reason === "banned" ? 403 : 422;
    return NextResponse.json({ error: result.message }, { status });
  }
  return NextResponse.json({ ok: true, id: result.id }, { status: 201 });
}
