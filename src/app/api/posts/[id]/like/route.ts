import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { togglePostLike } from "@/lib/board";
import { ANON_ID_COOKIE, ANON_ID_COOKIE_OPTIONS, getOrCreateAnonId } from "@/lib/anonId";

// 談話室の投稿への「いいね」。未ログインの来賓は匿名ID(Cookie)で判定する
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (userId) {
    const result = await togglePostLike({ userId }, params.id);
    return NextResponse.json(result);
  }

  const { anonId, isNew } = getOrCreateAnonId();
  const result = await togglePostLike({ anonId }, params.id);
  const res = NextResponse.json(result);
  if (isNew) {
    res.cookies.set(ANON_ID_COOKIE, anonId, ANON_ID_COOKIE_OPTIONS);
  }
  return res;
}
