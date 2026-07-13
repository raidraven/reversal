// ログイン試行のレート制限(総当たり攻撃対策)。
// プロセス内メモリでの簡易実装のため、複数インスタンス構成では効果が限定的な点に注意
// (本格運用ではRedis等の共有ストアに置き換えることを推奨)
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15分

type Attempt = { count: number; firstAttemptAt: number };

const attempts = new Map<string, Attempt>();

/** 直近WINDOW_MS以内の失敗回数がMAX_ATTEMPTS以上ならtrue */
export function isRateLimited(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

/** ログイン失敗を1回記録する */
export function recordFailedAttempt(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  entry.count += 1;
}

/** ログイン成功時に記録をクリアする */
export function clearAttempts(key: string): void {
  attempts.delete(key);
}
