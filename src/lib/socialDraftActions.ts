// 下書きの投稿・却下の実処理。管理画面のボタンとメールのワンクリックリンクの両方から共通で呼ばれる
import { prisma } from "@/lib/prisma";
import { postTweet } from "@/lib/x";

export type DraftActionResult = { ok: true } | { ok: false; error: string };

export async function publishDraftById(id: string): Promise<DraftActionResult> {
  const draft = await prisma.socialPostDraft.findUnique({ where: { id } });
  if (!draft) return { ok: false, error: "下書きが見つかりません" };
  if (draft.status !== "draft") return { ok: false, error: "この下書きは既に投稿済み・却下済みです" };
  if (draft.platform !== "x") return { ok: false, error: "未対応のプラットフォームです" };

  try {
    const result = await postTweet(draft.bodyText);
    await prisma.socialPostDraft.update({
      where: { id },
      data: { status: "posted", externalId: result.id, postedAt: new Date() },
    });
    return { ok: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "投稿に失敗しました";
    await prisma.socialPostDraft.update({ where: { id }, data: { errorMessage: message } });
    return { ok: false, error: message };
  }
}

export async function dismissDraftById(id: string): Promise<DraftActionResult> {
  const draft = await prisma.socialPostDraft.findUnique({ where: { id } });
  if (!draft) return { ok: false, error: "下書きが見つかりません" };
  if (draft.status !== "draft") return { ok: false, error: "投稿済み・却下済みの下書きは変更できません" };

  await prisma.socialPostDraft.update({ where: { id }, data: { status: "dismissed" } });
  return { ok: true };
}
