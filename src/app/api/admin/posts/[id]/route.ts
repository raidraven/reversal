import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { deletePost } from "@/lib/board";

export const dynamic = "force-dynamic";

// 管理ページから談話室の投稿を削除する
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await deletePost(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2025") {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 });
    }
    throw e;
  }
}
