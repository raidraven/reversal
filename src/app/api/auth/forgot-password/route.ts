import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";
import { isRateLimited, recordFailedAttempt } from "@/lib/loginRateLimit";

const bodySchema = z.object({
  email: z.string().email(),
});

// パスワード再設定メールを送る。アカウントの有無に関わらず常に同じレスポンスを返す(メールアドレス探索対策)
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "メールアドレスの形式を確認してください" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const rateLimitKey = `reset:${email}`;

  if (isRateLimited(rateLimitKey)) {
    // レート制限中も同じ成功レスポンスを返す(探索・スパム両対策)
    return NextResponse.json({ ok: true });
  }
  recordFailedAttempt(rateLimitKey);

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = await createPasswordResetToken(user.id);
    const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl).catch((e) => {
      console.error("password reset email error:", e);
    });
  }

  return NextResponse.json({ ok: true });
}
