import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  password: z.string().min(1),
});

// 退会(アカウント削除)。パスワード確認必須。関連データはPrismaのonDelete Cascadeで一括削除される
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "パスワードを入力してください" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}
