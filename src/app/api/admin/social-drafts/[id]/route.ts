import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 投稿前の本文編集
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json().catch(() => null);
  const bodyText = typeof body?.bodyText === "string" ? body.bodyText.trim() : null;
  if (!bodyText) return NextResponse.json({ error: "本文が空です" }, { status: 400 });

  const draft = await prisma.socialPostDraft.findUnique({ where: { id: params.id } });
  if (!draft) return NextResponse.json({ error: "下書きが見つかりません" }, { status: 404 });
  if (draft.status !== "draft") {
    return NextResponse.json({ error: "投稿済み・却下済みの下書きは編集できません" }, { status: 400 });
  }

  const updated = await prisma.socialPostDraft.update({
    where: { id: params.id },
    data: { bodyText },
  });
  return NextResponse.json({ draft: updated });
}

// 却下(投稿しない)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const draft = await prisma.socialPostDraft.findUnique({ where: { id: params.id } });
  if (!draft) return NextResponse.json({ error: "下書きが見つかりません" }, { status: 404 });
  if (draft.status !== "draft") {
    return NextResponse.json({ error: "投稿済み・却下済みの下書きは変更できません" }, { status: 400 });
  }

  await prisma.socialPostDraft.update({ where: { id: params.id }, data: { status: "dismissed" } });
  return NextResponse.json({ ok: true });
}
