import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createPost, getPosts } from "@/lib/board";
import { ANON_ID_COOKIE, ANON_ID_COOKIE_OPTIONS, getOrCreateAnonId, readAnonId } from "@/lib/anonId";
import { isPostCategory, POST_CATEGORIES } from "@/lib/boardCategories";

export const dynamic = "force-dynamic";

// 談話室の投稿一覧(未ログインでも閲覧可)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const categoryParam = new URL(req.url).searchParams.get("category");
  const category = categoryParam && isPostCategory(categoryParam) ? categoryParam : undefined;

  const posts = await getPosts(userId ? { userId } : { anonId: readAnonId() }, category);
  return NextResponse.json({ posts });
}

const bodySchema = z.object({
  category: z.enum(POST_CATEGORIES),
  title: z.string().min(1, "タイトルを入力してください").max(60, "タイトルは60文字以内で入力してください"),
  content: z.string().min(1, "内容を入力してください").max(2000, "内容は2000文字以内で入力してください"),
  revenueAmount: z.number().int().min(0).max(100_000_000).optional(),
  authorName: z.string().max(50).optional(),
});

// 談話室への投稿(未ログイン可)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  if (userId) {
    const result = await createPost({ userId }, parsed.data);
    if (!result.ok) {
      const status = result.reason === "banned" ? 403 : 422;
      return NextResponse.json({ error: result.message }, { status });
    }
    return NextResponse.json(result, { status: 201 });
  }

  const { anonId, isNew } = getOrCreateAnonId();
  const result = await createPost({ anonId }, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 422 });
  }
  const res = NextResponse.json(result, { status: 201 });
  if (isNew) {
    res.cookies.set(ANON_ID_COOKIE, anonId, ANON_ID_COOKIE_OPTIONS);
  }
  return res;
}
