// EXP・レベル・ストリーク・ミッション完了のサーバーサイドロジック
import { prisma } from "@/lib/prisma";
import { todayJst } from "@/lib/date";
import { levelFromExp } from "@/lib/leveling";
import { getTodaysMissions } from "@/lib/dailyMissions";
import { effectivePreviousLoginDay } from "@/lib/incidentDays";
import { isBanned } from "@/lib/bans";

/** 日次初回の来訪(入館)で得られる基礎EXP */
export const LOGIN_EXP = 15;

/** 連続ログイン1日につき加算されるボーナスEXP(上限あり) */
const STREAK_BONUS_PER_DAY = 2;
const STREAK_BONUS_CAP = 50;

/** 連続ログイン日数に応じたボーナスEXPを計算する */
export function streakBonusExp(currentStreak: number): number {
  return Math.min(currentStreak * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP);
}

export type DailyActivityResult =
  | { firstToday: false }
  | {
      firstToday: true;
      expGained: number;
      streakBonus: number;
      leveledUp: boolean;
      newLevel: number;
      currentStreak: number;
    };

/**
 * 日次アクティビティを記録する(冪等)。
 * ホーム表示時に呼ばれ、その日初回のみ LoginLog の作成・ストリーク更新・
 * 入館ボーナスEXPの付与を行う。
 */
export async function recordDailyActivity(userId: string): Promise<DailyActivityResult> {
  const today = todayJst();

  const streak = await prisma.streak.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  if (streak.lastLoginDate === today) return { firstToday: false };

  await prisma.loginLog.upsert({
    where: { userId_loginDate: { userId, loginDate: today } },
    create: { userId, loginDate: today },
    update: {},
  });

  // 通常は前日ログインしていれば継続。運営都合の障害日として登録された日を挟んでいる場合もスキップして判定する
  const continued = streak.lastLoginDate === (await effectivePreviousLoginDay(today));
  const currentStreak = continued ? streak.currentStreak + 1 : 1;
  const longestStreak = Math.max(currentStreak, streak.longestStreak);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const streakBonus = streakBonusExp(currentStreak);
  const expGained = LOGIN_EXP + streakBonus;
  const newExp = user.exp + expGained;
  const newLevel = levelFromExp(newExp);
  const leveledUp = newLevel > user.level;

  await prisma.$transaction([
    prisma.streak.update({
      where: { userId },
      data: { currentStreak, longestStreak, lastLoginDate: today },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        exp: newExp,
        level: newLevel,
        // ログインボーナス: 連続7日で限定称号、30日でプレミアム解放(フラグ管理)
        ...(currentStreak >= 7 ? { badge7Days: true } : {}),
        ...(currentStreak >= 30 ? { premiumUnlocked: true } : {}),
      },
    }),
  ]);

  return { firstToday: true, expGained, streakBonus, leveledUp, newLevel, currentStreak };
}

export type CompleteMissionResult =
  | { ok: true; expGained: number; leveledUp: boolean; newLevel: number }
  | { ok: false; reason: "not_found" | "not_today" | "already_completed" | "banned" };

/** ミッションを完了扱いにし、EXP・レベル・スキル値を更新する */
export async function completeMission(
  userId: string,
  missionId: string
): Promise<CompleteMissionResult> {
  if (await isBanned(userId)) {
    return { ok: false, reason: "banned" };
  }

  const mission = await prisma.mission.findUnique({ where: { id: missionId } });
  if (!mission) return { ok: false, reason: "not_found" };

  // 今日選出された3件以外は完了させない(古いIDでの不正なリクエスト対策)
  const todaysMissions = await getTodaysMissions();
  if (!todaysMissions.some((m) => m.id === missionId)) {
    return { ok: false, reason: "not_today" };
  }

  const today = todayJst();

  // 同日重複完了はユニーク制約で防ぐ
  try {
    await prisma.missionCompletion.create({
      data: { userId, missionId, completedDate: today },
    });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return { ok: false, reason: "already_completed" };
    }
    throw e;
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const newExp = user.exp + mission.expReward;
  const newLevel = levelFromExp(newExp);
  const leveledUp = newLevel > user.level;

  // 技量(スキル)はもうここで直接加算しない。実際の行動ログから都度算出する(→ src/lib/skills.ts)
  await prisma.user.update({
    where: { id: userId },
    data: { exp: newExp, level: newLevel },
  });

  return { ok: true, expGained: mission.expReward, leveledUp, newLevel };
}
