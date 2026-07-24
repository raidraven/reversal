import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateText } from "@/lib/moderation";

const linkSchema = z.object({
  label: z.string().trim().max(30),
  url: z
    .string()
    .trim()
    .max(300)
    .refine((v) => /^https?:\/\//i.test(v), { message: "http(s)から始まるURLを入力してください" }),
});

// 空文字="" は「非表示」、null は「デフォルト文言に戻す」、undefinedは「変更しない」の意味で扱う
const overrideText = z.string().trim().max(30).nullable().optional();

const bodySchema = z.object({
  bio: z.string().trim().max(150).optional(),
  links: z.array(linkSchema).max(10).optional(),
  cardHeaderText: overrideText,
  cardNameSuffixText: overrideText,
  cardLevelLabelText: overrideText,
  cardMemberSinceLabelText: overrideText,
  cardScale: z.number().int().min(50).max(200).optional(),
});

// 会員証に載せる一言バイオ・外部リンク・文言・表示倍率の保存
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容を確認してください" }, { status: 400 });
  }

  const { bio, links, cardHeaderText, cardNameSuffixText, cardLevelLabelText, cardMemberSinceLabelText, cardScale } =
    parsed.data;

  const textsToModerate = [bio, ...(links ?? []).map((l) => l.label)].filter((t): t is string => !!t);
  for (const text of textsToModerate) {
    const moderation = await moderateText(text);
    if (!moderation.allowed) {
      return NextResponse.json({ error: moderation.reason ?? "この内容は掲載できません" }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(bio !== undefined ? { bio: bio || null } : {}),
      ...(links !== undefined ? { links } : {}),
      ...(cardHeaderText !== undefined ? { cardHeaderText } : {}),
      ...(cardNameSuffixText !== undefined ? { cardNameSuffixText } : {}),
      ...(cardLevelLabelText !== undefined ? { cardLevelLabelText } : {}),
      ...(cardMemberSinceLabelText !== undefined ? { cardMemberSinceLabelText } : {}),
      ...(cardScale !== undefined ? { cardScale } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
