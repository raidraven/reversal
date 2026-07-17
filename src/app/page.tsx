import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteTexts } from "@/lib/siteText";
import { getLandingStats } from "@/lib/landingStats";
import { getTodaysMissions } from "@/lib/dailyMissions";
import { readAnonId } from "@/lib/anonId";
import { HostRequestForm } from "@/components/landing/HostRequestForm";
import { LoginPanel } from "@/components/landing/LoginPanel";
import { CompanionTrial } from "@/components/landing/CompanionTrial";
import { LogoutButton } from "@/components/LogoutButton";
import { QnaBoard } from "@/components/qna/QnaBoard";
import { BoardFeed } from "@/components/board/BoardFeed";
import { Icon } from "@/components/Icon";
import { EditableText } from "@/components/admin/EditableText";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  // 来賓数の重複排除キー: ログイン中はアカウント単位、未ログインは既存の匿名Cookie単位
  // (Server Componentからは新規Cookieを発行できないため、未発行の初回訪問はカウント対象外とする)
  const anonId = readAnonId();
  const visitorKey = session?.user?.id ? `user:${session.user.id}` : anonId ? `anon:${anonId}` : null;

  const [texts, stats, missions] = await Promise.all([
    getSiteTexts(),
    getLandingStats(visitorKey),
    getTodaysMissions(),
  ]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-6 py-12 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-10">
      {/* 左側:ログイン状態・主催者への要望 */}
      <aside className="order-2 mt-10 space-y-6 lg:order-1 lg:sticky lg:top-12 lg:mt-0">
        {isLoggedIn ? (
          <div className="game-card space-y-3 text-center">
            <p className="flex justify-center">
              <Icon name="candle" size={24} />
            </p>
            <p className="text-sm text-stone-300">ログイン中でございます</p>
            <Link href="/home" className="neon-button block text-center">
              {texts["room.backLabel"]}
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <LoginPanel />
        )}

        <div className="game-card">
          <h2 className="mansion-title text-base">主催者への要望</h2>
          <p className="mt-1 text-xs text-stone-500">
            館の運営についてのご意見・ご要望はこちらから。匿名でも構いません。
          </p>
          <div className="mt-3">
            <HostRequestForm
              placeholder={texts["hostRequest.placeholder"]}
              completedMessage={texts["hostRequest.completedMessage"]}
            />
          </div>
        </div>
      </aside>

      {/* 中央:コンテンツ */}
      <div className="order-1 mx-auto w-full max-w-md lg:order-2">
        <h1 className="mansion-title flex items-center gap-2 text-4xl">
          <Icon name="candle" size={36} />
          <EditableText siteTextKey="site.name" value={texts["site.name"]} />
        </h1>

        {!isLoggedIn && (
          <div className="mt-3 space-y-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-200">
              <EditableText siteTextKey="landing.benefit" value={texts["landing.benefit"]} multiline />
            </p>
            <Link href="/signup" className="neon-button block text-center">
              無料で招待状を受け取る
            </Link>
          </div>
        )}

        {!isLoggedIn && (
          <div className="mt-4">
            <CompanionTrial />
          </div>
        )}

        <div className="game-card mt-8 whitespace-pre-wrap text-sm leading-relaxed text-stone-300">
          <EditableText siteTextKey="landing.intro" value={texts["landing.intro"]} multiline />
        </div>

        {/* 主催者から一言 */}
        <div className="game-card mt-4">
          <h2 className="mansion-title text-base">
            <EditableText siteTextKey="landing.hostMessageTitle" value={texts["landing.hostMessageTitle"]} />
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-300">
            <EditableText siteTextKey="landing.hostMessage" value={texts["landing.hostMessage"]} multiline />
          </p>
        </div>

        {/* 館の活気(実データのみ) */}
        <div className="game-card mt-6 grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-2xl font-black text-gold-light">{stats.guestCount}</p>
            <p className="mt-1 text-[10px] leading-tight text-stone-500">
              <EditableText siteTextKey="landing.stats.guestLabel" value={texts["landing.stats.guestLabel"]} />
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-gold-light">{stats.registeredCount}</p>
            <p className="mt-1 text-[10px] leading-tight text-stone-500">
              <EditableText
                siteTextKey="landing.stats.registeredLabel"
                value={texts["landing.stats.registeredLabel"]}
              />
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-gold-light">{stats.missionCompletionCount}</p>
            <p className="mt-1 text-[10px] leading-tight text-stone-500">
              <EditableText siteTextKey="landing.stats.missionLabel" value={texts["landing.stats.missionLabel"]} />
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-gold-light">{stats.answerCount}</p>
            <p className="mt-1 text-[10px] leading-tight text-stone-500">
              <EditableText siteTextKey="landing.stats.answerLabel" value={texts["landing.stats.answerLabel"]} />
            </p>
          </div>
        </div>

        {/* 今宵の使命プレビュー(鍵付き) */}
        {missions.length > 0 && (
          <div className="game-card mt-4">
            <h2 className="mansion-title flex items-center gap-1.5 text-base">
              <Icon name="key-ornate" size={18} />
              <EditableText siteTextKey="mission.board.title" value={texts["mission.board.title"]} />
            </h2>
            <ul className="mt-2 space-y-1.5">
              {missions.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-sm text-stone-300">
                  <span>{m.title}</span>
                  <Icon name="lock" size={14} className="opacity-60" />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-stone-600">詳細と経験値は、扉の先で確認できます。</p>
          </div>
        )}

        {/* 今宵の問い(未ログインでも閲覧・いいね可) */}
        <div className="mt-4">
          <QnaBoard isLoggedIn={isLoggedIn} />
        </div>

        {/* 談話室の投稿(未ログインでも閲覧・いいね可) */}
        <div className="mt-4">
          <h2 className="mansion-title flex items-center gap-1.5 text-base">
            <Icon name="talk" size={18} />
            <EditableText siteTextKey="board.name" value={texts["board.name"]} />
          </h2>
          <div className="mt-2">
            <BoardFeed isLoggedIn={isLoggedIn} />
          </div>
        </div>

        <footer className="mt-8 flex flex-wrap justify-center gap-4 text-center text-xs text-stone-600">
          <Link href="/articles" className="hover:text-gold-light hover:underline">
            書庫(攻略記事)
          </Link>
          <Link href="/about" className="hover:text-gold-light hover:underline">
            運営者情報
          </Link>
          <Link href="/terms" className="hover:text-gold-light hover:underline">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:text-gold-light hover:underline">
            プライバシーポリシー
          </Link>
        </footer>
      </div>
    </main>
  );
}
