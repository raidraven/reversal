// ログイン試行のレート制限(総当たり攻撃対策)。
// DBで一元管理する(サーバーレスでは複数インスタンスにまたがるため、プロセスメモリだと
// カウントが安定せず、正しいパスワードでも誤ってブロックされることがあるため)
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15分

/** 直近WINDOW_MS以内の失敗回数がMAX_ATTEMPTS以上ならtrue */
export async function isRateLimited(key: string): Promise<boolean> {
  const record = await prisma.rateLimitAttempt.findUnique({ where: { key } });
  if (!record) return false;
  if (Date.now() - record.firstAttemptAt.getTime() > WINDOW_MS) {
    await prisma.rateLimitAttempt.delete({ where: { key } }).catch(() => {});
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

/** 失敗を1回記録する */
export async function recordFailedAttempt(key: string): Promise<void> {
  const record = await prisma.rateLimitAttempt.findUnique({ where: { key } });
  if (!record || Date.now() - record.firstAttemptAt.getTime() > WINDOW_MS) {
    await prisma.rateLimitAttempt.upsert({
      where: { key },
      create: { key, count: 1, firstAttemptAt: new Date() },
      update: { count: 1, firstAttemptAt: new Date() },
    });
    return;
  }
  await prisma.rateLimitAttempt.update({ where: { key }, data: { count: { increment: 1 } } });
}

/** 成功時に記録をクリアする */
export async function clearAttempts(key: string): Promise<void> {
  await prisma.rateLimitAttempt.deleteMany({ where: { key } });
}
