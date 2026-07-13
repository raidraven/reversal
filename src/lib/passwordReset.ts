// パスワード再設定トークンのロジック
// トークンはハッシュ化してDBに保存し、生の値はメールにのみ載せる(DB漏洩時の悪用を防ぐ)
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1時間

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** トークンを新規発行する(既存の未使用トークンは無効化する)。生のトークン文字列を返す */
export async function createPasswordResetToken(userId: string): Promise<string> {
  // 既存の未使用トークンは無効化(1人1つの有効トークンのみ)
  await prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return token;
}

export type VerifyTokenResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

/** トークンを検証する(消費はしない。実際のパスワード変更時にconsumePasswordResetTokenを呼ぶ) */
export async function verifyPasswordResetToken(token: string): Promise<VerifyTokenResult> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record) return { ok: false, reason: "invalid" };
  if (record.usedAt) return { ok: false, reason: "used" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "expired" };
  return { ok: true, userId: record.userId };
}

/** トークンを使用済みにする */
export async function consumePasswordResetToken(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { tokenHash: hashToken(token) },
    data: { usedAt: new Date() },
  });
}
