import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createPostComment, getPostComments } from "@/lib/board";
import { ANON_ID_COOKIE, ANON_ID_COOKIE_OPTIONS, getOrCreateAnonId } from "@/lib/anonId";
import { isBanned } from "@/lib/bans";

// GET: 投稿のコメント一覧(誰でも閲覧可)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const comments = await getPostComments(params.id);
  return NextResponse.json({ comments });
}

const bodySchema = z.object({
  authorName: z.string().max(50).optional(),
  content: z.string().min(1, "コメントを入力してください").max(1000, "コメントは1000文字以内で入力してください"),
});

// POST: コメントする(未ログイン可)
export async function POST(req: Request, { params }: { params: { id: string } }) {
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
    const result = await createPostComment({ userId }, params.id, parsed.data);
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json({ comment: result.comment }, { status: 201 });
  }

  const { anonId, isNew } = getOrCreateAnonId();
  const result = await createPostComment({ anonId }, params.id, parsed.data);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 });
  const res = NextResponse.json({ comment: result.comment }, { status: 201 });
  if (isNew) {
    res.cookies.set(ANON_ID_COOKIE, anonId, ANON_ID_COOKIE_OPTIONS);
  }
  return res;
}
