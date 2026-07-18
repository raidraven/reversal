import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(100, "タイトルは100文字以内で入力してください"),
  description: z
    .string()
    .min(1, "説明文を入力してください")
    .max(300, "説明文は300文字以内で入力してください"),
  content: z.string().min(1, "本文を入力してください").max(100_000),
  category: z.enum(["guide", "novel"]),
  published: z.boolean(),
});

// 記事の更新(公開/下書きの切り替え含む)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
  }

  try {
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        // 初めて公開状態になった時刻を publishedAt として記録する(公開日は以後変えない)
        publishedAt:
          parsed.data.published && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });
    return NextResponse.json({ article });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ error: "そのスラッグは既に使われています" }, { status: 409 });
    }
    throw e;
  }
}

// 記事の削除
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await prisma.article.delete({ where: { id: params.id } });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2025") {
      return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
}
