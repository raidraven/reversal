import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AVATARS } from "@/lib/onboarding";
import { titleForRank } from "@/lib/rankTitle";
import { getRanks } from "@/lib/ranks";
import { SITE_URL } from "@/lib/siteUrl";
import { parseCardLinks } from "@/lib/profileCard";
import { Icon } from "@/components/Icon";
import { ProfileCardMaker } from "@/components/profileCard/ProfileCardMaker";
import { ProfileCardEditor } from "@/components/profileCard/ProfileCardEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "プロフカードを作る | リバーサル",
  description: "AI副業の実況用プロフィールカードを、登録前に体験作成できます。",
};

export default async function ProfileCardPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  const user = isLoggedIn
    ? await prisma.user.findUnique({ where: { id: session!.user.id } })
    : null;
  const ranks = isLoggedIn ? await getRanks() : null;

  const wallpaperUrl = user?.cardWallpaperUrl ?? null;

  return (
    <main
      className="mx-auto max-w-md px-4 py-12"
      style={wallpaperUrl ? { backgroundImage: `url(${wallpaperUrl})`, backgroundSize: "cover" } : undefined}
    >
      <header className="mb-6 text-center">
        <p className="flex justify-center">
          <Icon name="mask" size={32} />
        </p>
        <h1 className="mansion-title mt-2 text-2xl">プロフカードを作る</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          名前・一言バイオ・外部リンクを入力すると、この館の会員証がその場でプレビューできます。
        </p>
      </header>

      {isLoggedIn && user ? (
        <ProfileCardEditor
          userId={user.id}
          siteUrl={SITE_URL}
          name={user.name}
          avatarIcon={AVATARS.find((a) => a.id === user.avatarId)?.icon ?? AVATARS[0].icon}
          level={user.level}
          title={titleForRank(user.level, ranks ?? undefined)}
          memberSince={user.createdAt.toISOString()}
          initialCardPublic={user.cardPublic}
          referralCount={await prisma.user.count({ where: { referredById: user.id } })}
          initialBio={user.bio ?? ""}
          initialLinks={parseCardLinks(user.links)}
          initialCardWallpaperUrl={user.cardWallpaperUrl}
          initialCardIconUrl={user.cardIconUrl}
          initialCardBgUrl={user.cardBgUrl}
          initialCardHeaderText={user.cardHeaderText}
          initialCardNameSuffixText={user.cardNameSuffixText}
          initialCardLevelLabelText={user.cardLevelLabelText}
          initialCardMemberSinceLabelText={user.cardMemberSinceLabelText}
          initialCardScale={user.cardScale}
        />
      ) : (
        <ProfileCardMaker />
      )}

      <p className="mt-8 text-center text-xs text-stone-500">
        <Link href="/" className="text-gold-light hover:underline">
          館の入口へ戻る
        </Link>
      </p>
    </main>
  );
}
