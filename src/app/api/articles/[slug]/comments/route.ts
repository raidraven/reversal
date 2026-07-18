import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createArticleComment, getArticleComments } from "@/lib/articles";
import { ANON_ID_COOKIE, ANON_ID_COOKIE_OPTIONS, getOrCreateAnonId } from "@/lib/anonId";
import { isBanned } from "@/lib/bans";

// GET: 記事・小説のコメント一覧(誰でも閲覧可)
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findFirst({
    where: { slug: params.slug, published: true },
    select: { id: true },
  });
  if (!article) {
    return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
  }

  const comments = await getArticleComments(article.id);
  return NextResponse.json({ comments });
}

const bodySchema = z.object({
  authorName: z.string().max(50).optional(),
  content: z.string().min(1, "コメントを入力してください").max(1000, "コメントは1000文字以内で入力してください"),
});

// POST: コメントする(未ログイン可)
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findFirst({
    where: { slug: params.slug, published: true },
    select: { id: true },
  });
  if (!article) {
    return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (userId && (await isBanned(userId))) {
    return NextResponse.json({ error: "このアカウントは通報により利用停止されています" }, { status: 403 });
  }

  if (userId) {
    const result = await createArticleComment({ userId }, article.id, parsed.data);
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json({ comment: result.comment }, { status: 201 });
  }

  const { anonId, isNew } = getOrCreateAnonId();
  const result = await createArticleComment({ anonId }, article.id, parsed.data);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 });
  const res = NextResponse.json({ comment: result.comment }, { status: 201 });
  if (isNew) {
    res.cookies.set(ANON_ID_COOKIE, anonId, ANON_ID_COOKIE_OPTIONS);
  }
  return res;
}
