import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ANON_ID_COOKIE, readAnonId } from "@/lib/anonId";
import { mergeAnonLikesIntoUser } from "@/lib/qna";
import { mergeAnonPostLikesIntoUser } from "@/lib/board";

// ログイン直後にクライアントから呼ぶ。匿名ID(Cookie)でのいいね(一問一答・談話室)を会員アカウントへ引き継ぐ
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const anonId = readAnonId();
  if (!anonId) {
    return NextResponse.json({ merged: false });
  }

  await Promise.all([
    mergeAnonLikesIntoUser(userId, anonId),
    mergeAnonPostLikesIntoUser(userId, anonId),
  ]);

  const res = NextResponse.json({ merged: true });
  res.cookies.set(ANON_ID_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
