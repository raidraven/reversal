import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedArticle, renderMarkdown } from "@/lib/articles";
import { Icon } from "@/components/Icon";

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

  const html = renderMarkdown(article.content);

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

        <footer className="mt-8 space-y-4 border-t border-surface-border pt-6">
          <div className="rounded-md border border-gold/30 bg-gold/5 p-4 text-center">
            <p className="text-sm text-stone-300">
              この館では、AI副業の継続をゲーム感覚で支援しています。
            </p>
            <Link href="/signup" className="neon-button mt-3 inline-block !px-6 text-sm">
              招待状を受け取る(無料)
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
