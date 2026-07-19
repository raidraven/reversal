import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { deriveDescriptionFromContent, generateArticleSlug } from "@/lib/articles";

export const dynamic = "force-dynamic";

// 管理ページ向け: 記事一覧(下書き含む)
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ articles });
}

const createSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(100, "タイトルは100文字以内で入力してください"),
  description: z.string().max(500, "説明文は500文字以内で入力してください").optional(),
  content: z.string().min(1, "本文を入力してください").max(100_000),
  category: z.enum(["guide", "novel"]).optional(),
  published: z.boolean().optional(),
});

// 記事の新規作成(スラッグは自動生成。衝突時は数回だけ再試行する)
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

  const { published, category, description, ...rest } = parsed.data;
  const resolvedCategory = category ?? "guide";
  const resolvedDescription = description?.trim() || deriveDescriptionFromContent(rest.content);

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const article = await prisma.article.create({
        data: {
          ...rest,
          description: resolvedDescription,
          slug: generateArticleSlug(resolvedCategory),
          category: resolvedCategory,
          published: published ?? false,
          publishedAt: published ? new Date() : null,
        },
      });
      return NextResponse.json({ article }, { status: 201 });
    } catch (e: unknown) {
      const isSlugConflict = typeof e === "object" && e !== null && "code" in e && e.code === "P2002";
      if (isSlugConflict && attempt < 4) continue;
      throw e;
    }
  }
  return NextResponse.json({ error: "記事の作成に失敗しました" }, { status: 500 });
}
