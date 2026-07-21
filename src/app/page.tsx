import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteTexts } from "@/lib/siteText";
import { getLandingStats } from "@/lib/landingStats";
import { getPublishedArticles } from "@/lib/articles";
import { getPosts } from "@/lib/board";
import { POST_CATEGORY_LABELS } from "@/lib/boardCategories";
import { readAnonId } from "@/lib/anonId";
import { HostRequestForm } from "@/components/landing/HostRequestForm";
import { LoginPanel } from "@/components/landing/LoginPanel";
import { LogoutButton } from "@/components/LogoutButton";
import { Icon } from "@/components/Icon";
import { EditableText } from "@/components/admin/EditableText";
import { AffiliateBanner } from "@/components/AffiliateBanner";
import { AdMaxSP, AdMaxPC } from "@/components/AdMax";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium" }).format(d);
}

function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium", timeStyle: "short" }).format(
    d
  );
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;

  // 来賓数の重複排除キー: ログイン中はアカウント単位、未ログインは既存の匿名Cookie単位
  // (Server Componentからは新規Cookieを発行できないため、未発行の初回訪問はカウント対象外とする)
  const anonId = readAnonId();
  const visitorKey = session?.user?.id ? `user:${session.user.id}` : anonId ? `anon:${anonId}` : null;

  const [texts, stats, latestArticles, latestPostsResult] = await Promise.all([
    getSiteTexts(),
    getLandingStats(visitorKey),
    getPublishedArticles(),
    getPosts(session?.user?.id ? { userId: session.user.id } : { anonId }, { pageSize: 1 }),
  ]);
  const latestArticle = latestArticles[0] ?? null;
  const latestPost = latestPostsResult.posts[0] ?? null;

  return (
    <>
      {/* 冒頭ヒーロー:洋館の一枚絵で世界観を掴む */}
      <section className="relative flex min-h-[46vh] items-end justify-center overflow-hidden px-6 pb-10 pt-24 sm:min-h-[56vh]">
        <div
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: "url(/images/mansion-bg.jpg)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/55 to-surface" aria-hidden />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h1 className="mansion-title flex items-center justify-center gap-2 text-4xl sm:text-5xl">
            <Icon name="candle" size={36} />
            <EditableText siteTextKey="site.name" value={texts["site.name"]} />
          </h1>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-200 sm:text-base">
            <EditableText siteTextKey="landing.intro" value={texts["landing.intro"]} multiline />
          </p>
        </div>
      </section>

      <main className="mx-auto flex max-w-5xl flex-col px-6 pb-12 lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-10">
      {/* 左側:ログイン状態・活気統計・主催者への要望(縦長サイドバー) */}
      <aside className="order-2 mt-10 space-y-6 lg:order-1 lg:mt-0">
        {isLoggedIn ? (
          <div className="game-card space-y-3 text-center">
            <p className="flex justify-center">
              <Icon name="candle" size={24} />
            </p>
            <p className="text-sm text-stone-300">
              <EditableText siteTextKey="landing.loggedInMessage" value={texts["landing.loggedInMessage"]} />
            </p>
            <LogoutButton />
          </div>
        ) : (
          <LoginPanel title={texts["login.title"]} subtitle={texts["login.subtitle"]} />
        )}

        {/* 館の活気(実データのみ) */}
        <div className="game-card grid grid-cols-2 gap-3 text-center">
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
        </div>

        <div className="game-card">
          <h2 className="mansion-title text-base">
            <EditableText siteTextKey="landing.hostRequestTitle" value={texts["landing.hostRequestTitle"]} />
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            <EditableText
              siteTextKey="landing.hostRequestDescription"
              value={texts["landing.hostRequestDescription"]}
            />
          </p>
          <div className="mt-3">
            <HostRequestForm
              placeholder={texts["hostRequest.placeholder"]}
              completedMessage={texts["hostRequest.completedMessage"]}
            />
          </div>
        </div>

        <div className="game-card">
          <AffiliateBanner />
        </div>

        <div className="game-card">
          <AdMaxSP />
          <AdMaxPC />
        </div>
      </aside>

      {/* 中央:コンテンツ(横長) */}
      <div className="order-1 mx-auto w-full max-w-2xl lg:order-2">
        {/* 最新の記事 */}
        <div className="game-card">
          <h2 className="mansion-title flex items-center gap-1.5 text-base">
            <Icon name="scroll" size={18} />
            <EditableText siteTextKey="landing.latestArticleTitle" value={texts["landing.latestArticleTitle"]} />
          </h2>
          {latestArticle ? (
            <Link
              href={`/articles/${latestArticle.slug}`}
              className="mt-2 block space-y-1 rounded-md border border-surface-border bg-surface-raised p-3 transition-colors hover:border-gold/40"
            >
              <p className="text-sm font-semibold text-stone-100">{latestArticle.title}</p>
              <p className="line-clamp-2 text-xs leading-relaxed text-stone-400">{latestArticle.description}</p>
              {latestArticle.publishedAt && (
                <p className="text-[10px] text-stone-600">{formatDate(latestArticle.publishedAt)}</p>
              )}
            </Link>
          ) : (
            <p className="mt-2 text-xs text-stone-500">
              <EditableText siteTextKey="articles.emptyMessage" value={texts["articles.emptyMessage"]} />
            </p>
          )}
          <p className="mt-2 text-right text-xs">
            <Link href="/articles" className="text-gold-light hover:underline">
              書庫をもっと見る
            </Link>
          </p>
        </div>

        {/* 最新の談話室投稿 */}
        <div className="mt-4">
          <h2 className="mansion-title flex items-center gap-1.5 text-base">
            <Icon name="talk" size={18} />
            <EditableText siteTextKey="landing.latestPostTitle" value={texts["landing.latestPostTitle"]} />
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            <EditableText siteTextKey="board.postNote" value={texts["board.postNote"]} />
          </p>
          <div className="mt-2">
            {latestPost ? (
              <div className="game-card space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>
                    {POST_CATEGORY_LABELS[latestPost.category]} · {latestPost.authorName}
                  </span>
                  <span className="shrink-0 text-[10px] text-stone-600">
                    {formatDateTime(latestPost.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-stone-100">{latestPost.title}</p>
                <p className="line-clamp-3 whitespace-pre-wrap text-sm text-stone-300">{latestPost.content}</p>
              </div>
            ) : (
              <p className="game-card text-sm text-stone-500">
                <EditableText siteTextKey="board.emptyMessage" value={texts["board.emptyMessage"]} />
              </p>
            )}
          </div>
          <p className="mt-2 text-right text-xs">
            <Link href="/board" className="text-gold-light hover:underline">
              {texts["board.name"]}をもっと見る
            </Link>
          </p>
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
    </>
  );
}
