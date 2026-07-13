import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { moderateText } from "@/lib/moderation";

// 「主催者への要望」— 誰でも(未ログインでも)送信できる公開フォーム
const bodySchema = z.object({
  content: z.string().min(1, "内容を入力してください").max(2000, "2000文字以内で入力してください"),
  name: z.string().max(50).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  const name = parsed.data.name?.trim();

  const moderation = await moderateText(parsed.data.content);
  if (!moderation.allowed) {
    return NextResponse.json({ error: moderation.reason }, { status: 422 });
  }

  try {
    await prisma.hostRequest.create({
      data: {
        content: parsed.data.content.trim(),
        ...(name ? { name } : {}),
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("host-request submit error:", e);
    return NextResponse.json(
      { error: "送信に失敗しました。時間をおいて再度お試しください" },
      { status: 500 }
    );
  }
}
