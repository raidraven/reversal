import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// 管理ページ向け: 記事一覧(下書き含む)
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ articles });
}

const createSchema = z.object({
  slug: z
    .string()
    .min(1, "スラッグを入力してください")
    .max(100, "スラッグは100文字以内で入力してください")
    .regex(/^[a-z0-9-]+$/, "スラッグは英小文字・数字・ハイフンのみ使用できます"),
  title: z.string().min(1, "タイトルを入力してください").max(100, "タイトルは100文字以内で入力してください"),
  description: z
    .string()
    .min(1, "説明文を入力してください")
    .max(300, "説明文は300文字以内で入力してください"),
  content: z.string().min(1, "本文を入力してください").max(100_000),
  published: z.boolean().optional(),
});

// 記事の新規作成
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  try {
    const { published, ...rest } = parsed.data;
    const article = await prisma.article.create({
      data: {
        ...rest,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
      },
    });
    return NextResponse.json({ article }, { status: 201 });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json({ error: "そのスラッグは既に使われています" }, { status: 409 });
    }
    throw e;
  }
}
