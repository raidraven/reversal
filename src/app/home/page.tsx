import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AVATARS } from "@/lib/onboarding";
import { expProgress } from "@/lib/leveling";
import { titleForRank } from "@/lib/rankTitle";
import { getRanks } from "@/lib/ranks";
import { getSiteTexts } from "@/lib/siteText";
import { todayJst } from "@/lib/date";
import { recordDailyActivity } from "@/lib/game";
import { getTodaysMissions } from "@/lib/dailyMissions";
import { computeSkillTotals } from "@/lib/skills";
import { Icon } from "@/components/Icon";
import { PlayerStatusCard } from "@/components/home/PlayerStatusCard";
import { MemberCard } from "@/components/home/MemberCard";
import { CardSettingsPanel } from "@/components/home/CardSettingsPanel";
import { StreakCard } from "@/components/home/StreakCard";
import { MissionBoard } from "@/components/home/MissionBoard";
import { SkillRadarChart } from "@/components/home/SkillRadarChart";
import { CompanionGreeting } from "@/components/home/CompanionGreeting";
import { CompanionChat } from "@/components/companion/CompanionChat";
import { LoginBonusToast } from "@/components/home/LoginBonusToast";
import { QnaBoard } from "@/components/qna/QnaBoard";
import { EditableText } from "@/components/admin/EditableText";
import { SITE_URL } from "@/lib/siteUrl";
import { parseCardLinks } from "@/lib/profileCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // JWTは最長30日有効なため、追放(banned)が確定した後もセッションが生き続ける可能性がある。
  // 訪問のたびにDBを見て強制的に締め出す(ミドルウェアはEdge実行のためDBを引けない)
  const bannedCheck = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { banned: true },
  });
  if (!bannedCheck || bannedCheck.banned) redirect("/login");

  // JWTセッションで長期ログインしたままの来賓も、日次アクセスでストリーク・入館ボーナスを更新
  const dailyResult = await recordDailyActivity(session.user.id);

  const today = todayJst();
  const [user, missions, completions, ranks, texts, skills, referralCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { streak: true },
    }),
    getTodaysMissions(today),
    prisma.missionCompletion.findMany({
      where: { userId: session.user.id, completedDate: today },
      select: { missionId: true },
    }),
    getRanks(),
    getSiteTexts(),
    computeSkillTotals(session.user.id),
    prisma.user.count({ where: { referredById: session.user.id } }),
  ]);
  if (!user) redirect("/login");

  const completedIds = new Set(completions.map((c) => c.missionId));
  const missionItems = missions.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    expReward: m.expReward,
    skillKey: m.skillKey,
    done: completedIds.has(m.id),
  }));

  const avatar = AVATARS.find((a) => a.id === user.avatarId) ?? AVATARS[0];
  const progress = expProgress(user.exp);
  const title = titleForRank(user.level, ranks);

  // recordDailyActivity 後に取得しているため lastLoginDate は必ず今日。
  // 「途切れそう」警告は、今日まだミッションを1件もこなしていない場合に表示する
  const streak = user.streak;
  const atRisk = completedIds.size === 0;

  return (
    <main className="mx-auto max-w-md px-4 pb-24 lg:max-w-5xl">
      <header className="flex items-center justify-between py-4">
        <h1 className="mansion-title flex items-center gap-2 text-lg">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Icon name="candle" size={24} />
            <EditableText siteTextKey="site.name" value={texts["site.name"]} />
          </Link>
        </h1>
      </header>

      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {/* 左カラム(モバイルでは縦積み) */}
        <div className="space-y-4">
          <CompanionGreeting name={user.name} />
          <PlayerStatusCard
            name={user.name}
            avatarIcon={avatar.icon}
            level={user.level}
            title={title}
            expCurrent={progress.current}
            expRequired={progress.required}
          />
          <StreakCard
            currentStreak={streak?.currentStreak ?? 0}
            longestStreak={streak?.longestStreak ?? 0}
            atRisk={atRisk}
            label={texts["streak.label"]}
          />
          <MemberCard
            name={user.name}
            avatarIcon={avatar.icon}
            level={user.level}
            title={title}
            memberSince={user.createdAt}
            bio={user.bio}
            links={parseCardLinks(user.links)}
            cardIconUrl={user.cardIconUrl}
            cardBgUrl={user.cardBgUrl}
            headerText={user.cardHeaderText}
            nameSuffixText={user.cardNameSuffixText}
            levelLabelText={user.cardLevelLabelText}
            memberSinceLabelText={user.cardMemberSinceLabelText}
            scale={user.cardScale}
          />
          <CardSettingsPanel
            userId={user.id}
            siteUrl={SITE_URL}
            initialCardPublic={user.cardPublic}
            referralCount={referralCount}
          />
          <QnaBoard isLoggedIn />
        </div>

        {/* 右カラム */}
        <div className="space-y-4">
          <MissionBoard
            missions={missionItems}
            ranks={ranks}
            boardTitle={texts["mission.board.title"]}
          />
          <SkillRadarChart
            boardTitle={texts["skill.board.title"]}
            skills={{
              writing: skills.writing,
              toolUsage: skills.toolUsage,
              consistency: skills.consistency,
              publishing: skills.publishing,
              monetization: skills.monetization,
            }}
          />
        </div>
      </div>

      <CompanionChat />
      <LoginBonusToast result={dailyResult} ranks={ranks} />
    </main>
  );
}
