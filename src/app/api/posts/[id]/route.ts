import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { deleteOwnPost, updateOwnPost } from "@/lib/board";
import { readAnonId } from "@/lib/anonId";

const bodySchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(60, "タイトルは60文字以内で入力してください"),
  content: z.string().min(1, "内容を入力してください").max(2000, "内容は2000文字以内で入力してください"),
  revenueAmount: z.number().int().min(0).max(100_000_000).optional(),
});

// 投稿者本人によるスレッドの編集
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const anonId = readAnonId();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  const result = await updateOwnPost(userId ? { userId } : { anonId }, params.id, parsed.data);
  if (!result.ok) {
    if (result.reason === "not_found") return NextResponse.json({ error: "スレッドが見つかりません" }, { status: 404 });
    if (result.reason === "forbidden") return NextResponse.json({ error: "編集する権限がありません" }, { status: 403 });
    return NextResponse.json({ error: result.reason === "rejected" ? result.message : "保存に失敗しました" }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}

// 投稿者本人によるスレッドの削除
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const anonId = readAnonId();

  const result = await deleteOwnPost(userId ? { userId } : { anonId }, params.id);
  if (!result.ok) {
    if (result.reason === "not_found") return NextResponse.json({ error: "スレッドが見つかりません" }, { status: 404 });
    return NextResponse.json({ error: "削除する権限がありません" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
