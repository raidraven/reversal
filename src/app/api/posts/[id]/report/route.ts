import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reportPost } from "@/lib/board";

// 談話室の投稿を通報する(要ログイン)。異なる通報者から計3件以上で投稿者を自動追放する
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const result = await reportPost(session.user.id, params.id);
  if (!result.ok) {
    return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
  }
  return NextResponse.json(result);
}
