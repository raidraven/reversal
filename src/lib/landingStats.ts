// ランディングページの「館の活気」統計(実データのみ・誇張なし)
import { prisma } from "@/lib/prisma";

const LANDING_VIEWS_KEY = "landing_views";

export type LandingStats = {
  /** ランディングページの表示回数(=来賓数。会員登録の有無を問わない訪問数) */
  guestCount: number;
  /** 会員登録者数 */
  registeredCount: number;
  missionCompletionCount: number;
  answerCount: number;
};

/** ランディングページの表示回数を1件加算し、加算後の値を返す */
async function incrementLandingViews(): Promise<number> {
  const counter = await prisma.siteCounter.upsert({
    where: { key: LANDING_VIEWS_KEY },
    create: { key: LANDING_VIEWS_KEY, count: 1 },
    update: { count: { increment: 1 } },
  });
  return counter.count;
}

export async function getLandingStats(): Promise<LandingStats> {
  const [guestCount, registeredCount, missionCompletionCount, answerCount] = await Promise.all([
    incrementLandingViews(),
    prisma.user.count(),
    prisma.missionCompletion.count(),
    prisma.answer.count(),
  ]);
  return { guestCount, registeredCount, missionCompletionCount, answerCount };
}
