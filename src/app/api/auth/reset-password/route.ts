import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyPasswordResetToken, consumePasswordResetToken } from "@/lib/passwordReset";

const bodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "パスワードは8文字以上で入力してください").max(72),
});

// パスワード再設定を実行する
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const result = await verifyPasswordResetToken(token);
  if (!result.ok) {
    const message =
      result.reason === "expired"
        ? "このリンクの有効期限が切れています。もう一度パスワード再設定をお申し込みください"
        : result.reason === "used"
          ? "このリンクは既に使用されています"
          : "リンクが無効です";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: result.userId }, data: { passwordHash } });
  await consumePasswordResetToken(token);

  return NextResponse.json({ ok: true });
}
