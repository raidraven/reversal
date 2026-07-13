import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getAllPostsForAdmin } from "@/lib/board";

export const dynamic = "force-dynamic";

// 管理ページ向け:談話室の全投稿を通報件数つきで一覧取得する
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const posts = await getAllPostsForAdmin();
  return NextResponse.json({ posts });
}
