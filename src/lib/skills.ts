// 技量(スキル)の算出ロジック
// 「今日出たデイリーミッションをこなしただけ」で全員が同じように伸びてしまわないよう、
// SkillScore(登録時の初期診断による基礎値)に、実際の行動ログから計算した伸び幅を
// 都度加算して算出する(SkillScore自体はミッション完了では増やさない。onboarding.ts参照)
import { prisma } from "@/lib/prisma";
import { toJstDateString } from "@/lib/date";

export const SKILL_KEYS = [
  "writing",
  "toolUsage",
  "consistency",
  "publishing",
  "monetization",
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];
export type SkillTotals = Record<SkillKey, number>;

const SKILL_MIN = 10;
const SKILL_MAX = 100;

const DEFAULT_BASELINE: SkillTotals = {
  writing: 10,
  toolUsage: 10,
  consistency: 10,
  publishing: 10,
  monetization: 10,
};

function clamp(value: number): number {
  return Math.min(SKILL_MAX, Math.max(SKILL_MIN, Math.round(value)));
}

/**
 * 実際の行動ログ(投稿数・AI相談回数・継続日数など)から、ユーザーごとの技量を算出する。
 * 同じデイリーミッションが出た日でも、実際にどれだけ行動したかで結果が変わる。
 */
export async function computeSkillTotals(userId: string): Promise<SkillTotals> {
  const [
    baseline,
    answerCount,
    questionCount,
    companionMessageCount,
    likesGivenCount,
    loginDayCount,
    streak,
    missionCompletions,
    postLikesGivenCount,
    posts,
  ] = await Promise.all([
    prisma.skillScore.findUnique({ where: { userId } }),
    prisma.answer.count({ where: { authorId: userId } }),
    prisma.question.count({ where: { authorId: userId } }),
    prisma.companionMessage.count({ where: { userId, role: "user" } }),
    prisma.answerLike.count({ where: { userId } }),
    prisma.loginLog.count({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.missionCompletion.findMany({
      where: { userId },
      include: { mission: { select: { skillKey: true } } },
    }),
    prisma.postLike.count({ where: { userId } }),
    prisma.post.findMany({
      where: { authorId: userId },
      select: { category: true, createdAt: true, revenueAmount: true },
    }),
  ]);

  const missionSkillCounts: Partial<Record<SkillKey, number>> = {};
  for (const c of missionCompletions) {
    const key = c.mission.skillKey as SkillKey;
    missionSkillCounts[key] = (missionSkillCounts[key] ?? 0) + 1;
  }
  const missionCount = (key: SkillKey) => missionSkillCounts[key] ?? 0;

  // 談話室の投稿は連投で無制限に伸ばせないよう、金額や件数そのものではなく
  // 「投稿した日数(JST日付のユニーク数)」で数える(1日1回のEXP付与ルールと揃える)
  const writingPostDays = new Set<string>();
  const toolPostDays = new Set<string>();
  const monetizationReportDays = new Set<string>();
  for (const p of posts) {
    const day = toJstDateString(p.createdAt);
    if (p.category === "achievement" || p.category === "tip") writingPostDays.add(day);
    if (p.category === "tool") toolPostDays.add(day);
    if (p.category === "achievement" && p.revenueAmount != null) monetizationReportDays.add(day);
  }

  const base = baseline ?? DEFAULT_BASELINE;

  return {
    // 回答・質問・談話室(実績/学び)の投稿日数を中心に、ミッション経由の報告も加味
    writing: clamp(
      base.writing + answerCount * 3 + questionCount * 5 + writingPostDays.size * 3 + missionCount("writing") * 2
    ),
    // クロエ(AI)への相談回数・談話室でのツール共有投稿を中心に評価
    toolUsage: clamp(
      base.toolUsage + companionMessageCount * 1 + toolPostDays.size * 3 + missionCount("toolUsage") * 2
    ),
    // 累計ログイン日数・自己最長ストリークで継続力を評価
    consistency: clamp(
      base.consistency + loginDayCount * 2 + (streak?.longestStreak ?? 0) * 1 + missionCount("consistency") * 2
    ),
    // 他者への「いいね」(一問一答・談話室どちらも)や投稿ミッションの実績を評価
    publishing: clamp(
      base.publishing + likesGivenCount * 1 + postLikesGivenCount * 1 + missionCount("publishing") * 3
    ),
    // 「収益を出す」ミッションの完了報告に加え、談話室で収益報告した日数を反映(金額そのものは見ない)
    monetization: clamp(
      base.monetization + missionCount("monetization") * 8 + monetizationReportDays.size * 8
    ),
  };
}
