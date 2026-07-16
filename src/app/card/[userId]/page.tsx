import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AVATARS } from "@/lib/onboarding";
import { titleForRank } from "@/lib/rankTitle";
import { getRanks } from "@/lib/ranks";
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
  const [user, ranks] = await Promise.all([
    prisma.user.findUnique({ where: { id: params.userId } }),
    getRanks(),
  ]);

  const notFoundOrPrivate = !user || !user.cardPublic || user.banned;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
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
  );
}
