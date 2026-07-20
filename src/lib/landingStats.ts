// ランディングページの「館の活気」統計(実データのみ・誇張なし)
import { prisma } from "@/lib/prisma";

export type LandingStats = {
  /** 来賓数(1アカウント/1匿名Cookieにつき1回のみカウントする重複排除済みの訪問者数) */
  guestCount: number;
  /** 会員登録者数 */
  registeredCount: number;
};

/**
 * ランディングページの訪問を記録する(1visitorにつき1回のみ)。
 * visitorKeyが無い(未ログイン・匿名Cookie未発行)場合は記録をスキップする。
 */
async function recordLandingVisit(visitorKey: string | null): Promise<void> {
  if (!visitorKey) return;
  await prisma.landingVisit.upsert({
    where: { visitorKey },
    create: { visitorKey },
    update: {},
  });
}

export async function getLandingStats(visitorKey: string | null): Promise<LandingStats> {
  await recordLandingVisit(visitorKey);

  const [guestCount, registeredCount] = await Promise.all([
    prisma.landingVisit.count(),
    prisma.user.count(),
  ]);
  return { guestCount, registeredCount };
}
