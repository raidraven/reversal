import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dismissDraftById } from "@/lib/socialDraftActions";
import { renderActionResultPage } from "@/lib/socialDraftActionPage";

export const dynamic = "force-dynamic";

function htmlResponse(html: string) {
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// メール内の「却下」リンク。ログイン不要だが、下書き1件ごとの使い捨てトークンでのみ実行できる
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const draft = await prisma.socialPostDraft.findUnique({ where: { approveToken: params.token } });
  if (!draft || draft.status !== "draft") {
    return htmlResponse(
      renderActionResultPage({ ok: false, message: "このリンクは無効です(既に使用済みか、下書きが見つかりません)。" })
    );
  }

  const claim = await prisma.socialPostDraft.updateMany({
    where: { id: draft.id, approveToken: params.token, status: "draft" },
    data: { approveToken: null },
  });
  if (claim.count === 0) {
    return htmlResponse(renderActionResultPage({ ok: false, message: "この下書きは既に処理されています。" }));
  }

  const result = await dismissDraftById(draft.id);
  if (!result.ok) {
    return htmlResponse(renderActionResultPage({ ok: false, message: result.error }));
  }
  return htmlResponse(renderActionResultPage({ ok: true, message: "この下書きを却下しました(投稿はされません)。" }));
}
