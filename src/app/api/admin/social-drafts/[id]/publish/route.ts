import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { publishDraftById } from "@/lib/socialDraftActions";

export const dynamic = "force-dynamic";

// 管理者が最終確認した本文をXへ実際に投稿する(外部公開トリガーの一つ。もう一つはメールのワンクリックリンク)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const result = await publishDraftById(params.id);
  if (!result.ok) {
    const VALIDATION_ERRORS = ["下書きが見つかりません", "この下書きは既に投稿済み・却下済みです", "未対応のプラットフォームです"];
    const status = result.error === "下書きが見つかりません" ? 404 : VALIDATION_ERRORS.includes(result.error) ? 400 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  const draft = await prisma.socialPostDraft.findUnique({ where: { id: params.id } });
  return NextResponse.json({ draft });
}
