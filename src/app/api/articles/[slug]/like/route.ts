import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleArticleLike } from "@/lib/articles";
import { ANON_ID_COOKIE, ANON_ID_COOKIE_OPTIONS, getOrCreateAnonId } from "@/lib/anonId";

// 記事・小説への「いいね」。未ログインの来賓は匿名ID(Cookie)で判定する
export async function POST(_req: Request, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findFirst({
    where: { slug: params.slug, published: true },
    select: { id: true },
  });
  if (!article) {
    return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (userId) {
    const result = await toggleArticleLike({ userId }, article.id);
    return NextResponse.json(result);
  }

  const { anonId, isNew } = getOrCreateAnonId();
  const result = await toggleArticleLike({ anonId }, article.id);
  const res = NextResponse.json(result);
  if (isNew) {
    res.cookies.set(ANON_ID_COOKIE, anonId, ANON_ID_COOKIE_OPTIONS);
  }
  return res;
}
