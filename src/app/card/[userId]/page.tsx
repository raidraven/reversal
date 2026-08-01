import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AVATARS } from "@/lib/onboarding";
import { titleForRank } from "@/lib/rankTitle";
import { getRanks } from "@/lib/ranks";
import { parseCardLinks } from "@/lib/profileCard";
import { MemberCard } from "@/components/home/MemberCard";
import { Icon } from "@/components/Icon";

type Props = { params: { userId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { name: true, cardPublic: true },
  });
  if (!user || !user.cardPublic) return { title: "会員証 | REVERSAL" };
  return {
    title: `${user.name} 様の会員証 | REVERSAL`,
    description: "REVERSALの会員証です。",
  };
}

export default async function PublicCardPage({ params }: Props) {
  const [session, user, ranks] = await Promise.all([
    getServerSession(authOptions),
    prisma.user.findUnique({ where: { id: params.userId } }),
    getRanks(),
  ]);

  // 本人が非公開のまま個別ページの見た目をプレビューできるようにする(第三者には引き続き非公開)
  const isOwnerPreview = !!session?.user?.id && session.user.id === params.userId;

  const notFoundOrPrivate = !user || (!user.cardPublic && !isOwnerPreview) || user.banned;
  const wallpaperUrl = user?.cardWallpaperUrl ?? null;

  return (
    <>
      {wallpaperUrl && !notFoundOrPrivate && (
        <div
          className="fixed inset-0 -z-10"
          style={{ backgroundImage: `url(${wallpaperUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
        {isOwnerPreview && !user!.cardPublic && (
          <p className="mb-4 text-center text-xs text-gold-light">
            プレビュー中(現在は非公開設定です。第三者には表示されません)
          </p>
        )}
        {notFoundOrPrivate ? (
          <div className="game-card space-y-3 text-center">
            <p className="flex justify-center">
              <Icon name="lock" size={28} />
            </p>
            <h1 className="mansion-title text-xl">この会員証は非公開です</h1>
            <p className="text-sm text-stone-400">本人が公開設定にしていないか、見つかりませんでした。</p>
          </div>
        ) : (
          <MemberCard
            name={user.name}
            avatarIcon={AVATARS.find((a) => a.id === user.avatarId)?.icon ?? AVATARS[0].icon}
            level={user.level}
            title={titleForRank(user.level, ranks)}
            memberSince={user.createdAt}
            bio={user.bio}
            links={parseCardLinks(user.links)}
            cardIconUrl={user.cardIconUrl}
            cardBgUrl={user.cardBgUrl}
            headerText={user.cardHeaderText}
            nameSuffixText={user.cardNameSuffixText}
            titleText={user.cardTitleText}
            levelLabelText={user.cardLevelLabelText}
            memberSinceLabelText={user.cardMemberSinceLabelText}
            scale={user.cardScale}
          />
        )}

        <div className="mt-6 text-center">
          <Link href={`/signup?ref=${params.userId}`} className="neon-button inline-block !px-6 text-sm">
            あなたも入館する
          </Link>
          <p className="mt-3 text-xs text-stone-500">
            <Link href="/" className="text-gold-light hover:underline">
              館の入口へ戻る
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
