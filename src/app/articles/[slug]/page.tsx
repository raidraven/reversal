import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAnonId } from "@/lib/anonId";
import {
  getArticleComments,
  getArticleLikeState,
  getPublishedArticle,
  renderMarkdown,
} from "@/lib/articles";
import { getSiteTexts } from "@/lib/siteText";
import { Icon } from "@/components/Icon";
import { EditableText } from "@/components/admin/EditableText";
import { ArticleEngagement } from "@/components/articles/ArticleEngagement";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getPublishedArticle(params.slug);
  if (!article) return { title: "書物が見つかりません | リバーサル" };

  return {
    title: `${article.title} | リバーサル`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      ...(article.publishedAt ? { publishedTime: article.publishedAt.toISOString() } : {}),
    },
  };
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium" }).format(d);
}

export default async function ArticlePage({ params }: Props) {
  const article = await getPublishedArticle(params.slug);
  if (!article) notFound();

  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;
  const anonId = readAnonId();
  const viewer = session?.user?.id ? { userId: session.user.id } : anonId ? { anonId } : {};

  const html = renderMarkdown(article.content);
  const [{ likeCount, likedByMe }, comments, texts] = await Promise.all([
    getArticleLikeState(viewer, article.id),
    getArticleComments(article.id),
    getSiteTexts(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <article className="game-card">
        <header className="border-b border-surface-border pb-4">
          <h1 className="mansion-title text-2xl">{article.title}</h1>
          {article.publishedAt && (
            <p className="mt-2 text-xs text-stone-500">{formatDate(article.publishedAt)}</p>
          )}
        </header>

        {/* 記事は管理者のみが執筆するため、生成HTMLをそのまま描画する */}
        <div className="article-body mt-6" dangerouslySetInnerHTML={{ __html: html }} />

        <ArticleEngagement
          slug={article.slug}
          initialLikeCount={likeCount}
          initialLikedByMe={likedByMe}
          initialComments={comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
          isLoggedIn={isLoggedIn}
        />

        <footer className="mt-8 space-y-4 border-t border-surface-border pt-6">
          <div className="rounded-md border border-gold/30 bg-gold/5 p-4 text-center">
            <p className="text-sm text-stone-300">
              <EditableText siteTextKey="article.ctaText" value={texts["article.ctaText"]} />
            </p>
            <Link href="/signup" className="neon-button mt-3 inline-block !px-6 text-sm">
              <EditableText siteTextKey="article.ctaButton" value={texts["article.ctaButton"]} />
            </Link>
          </div>
          <p className="text-center text-xs text-stone-500">
            <Link href="/articles" className="text-gold-light hover:underline">
              書庫へ戻る
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}
