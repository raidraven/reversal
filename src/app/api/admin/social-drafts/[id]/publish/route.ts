import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { postTweet } from "@/lib/x";

export const dynamic = "force-dynamic";

// 管理者が最終確認した本文をXへ実際に投稿する(唯一の外部公開トリガー)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const draft = await prisma.socialPostDraft.findUnique({ where: { id: params.id } });
  if (!draft) return NextResponse.json({ error: "下書きが見つかりません" }, { status: 404 });
  if (draft.status !== "draft") {
    return NextResponse.json({ error: "この下書きは既に投稿済み・却下済みです" }, { status: 400 });
  }
  if (draft.platform !== "x") {
    return NextResponse.json({ error: "未対応のプラットフォームです" }, { status: 400 });
  }

  try {
    const result = await postTweet(draft.bodyText);
    const updated = await prisma.socialPostDraft.update({
      where: { id: params.id },
      data: { status: "posted", externalId: result.id, postedAt: new Date() },
    });
    return NextResponse.json({ draft: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "投稿に失敗しました";
    await prisma.socialPostDraft.update({
      where: { id: params.id },
      data: { errorMessage: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
