// ランディングページの「館の活気」統計(実データのみ・誇張なし)
import { prisma } from "@/lib/prisma";

export type LandingStats = {
  guestCount: number;
  missionCompletionCount: number;
  answerCount: number;
};

export async function getLandingStats(): Promise<LandingStats> {
  const [guestCount, missionCompletionCount, answerCount] = await Promise.all([
    prisma.user.count(),
    prisma.missionCompletion.count(),
    prisma.answer.count(),
  ]);
  return { guestCount, missionCompletionCount, answerCount };
}
