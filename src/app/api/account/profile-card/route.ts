import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateText } from "@/lib/moderation";

const urlField = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), { message: "http(s)から始まるURLを入力してください" });

const bodySchema = z.object({
  bio: z.string().trim().max(150).optional(),
  link1Label: z.string().trim().max(30).optional(),
  link1Url: urlField.optional(),
  link2Label: z.string().trim().max(30).optional(),
  link2Url: urlField.optional(),
});

// 会員証(/card/[id])に載せる一言バイオ・外部リンクの保存
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容を確認してください" }, { status: 400 });
  }

  const { bio, link1Label, link1Url, link2Label, link2Url } = parsed.data;

  if (bio) {
    const moderation = await moderateText(bio);
    if (!moderation.allowed) {
      return NextResponse.json({ error: moderation.reason ?? "この内容は掲載できません" }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio: bio || null,
      link1Label: link1Url ? link1Label || null : null,
      link1Url: link1Url || null,
      link2Label: link2Url ? link2Label || null : null,
      link2Url: link2Url || null,
    },
  });

  return NextResponse.json({ ok: true });
}
