import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import { ProfileCardMaker } from "@/components/profileCard/ProfileCardMaker";

export const metadata: Metadata = {
  title: "プロフカードを作る | リバーサル",
  description: "AI副業の実況用プロフィールカードを、登録前に体験作成できます。",
};

export default async function ProfileCardPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <header className="mb-6 text-center">
        <p className="flex justify-center">
          <Icon name="mask" size={32} />
        </p>
        <h1 className="mansion-title mt-2 text-2xl">プロフカードを作る</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          名前・一言バイオ・外部リンクを入力すると、この館の会員証がその場でプレビューできます。
        </p>
      </header>

      {isLoggedIn ? (
        <div className="game-card space-y-3 text-center">
          <p className="text-sm text-stone-300">
            すでに入館済みですね。プロフィールの編集・公開設定は自室ページから行えます。
          </p>
          <Link href="/home" className="neon-button block text-center">
            自室へ移動する
          </Link>
        </div>
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
