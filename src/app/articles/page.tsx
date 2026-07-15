import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "書庫(攻略記事) | リバーサル",
  description:
    "AI副業の始め方・続け方を、運営者自身の実践記録とともにまとめた攻略記事の書庫です。",
  openGraph: {
    title: "書庫(攻略記事) | リバーサル",
    description:
      "AI副業の始め方・続け方を、運営者自身の実践記録とともにまとめた攻略記事の書庫です。",
    type: "website",
  },
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium" }).format(d);
}

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-6 text-center">
        <p className="flex justify-center">
          <Icon name="scroll" size={32} />
        </p>
        <h1 className="mansion-title mt-2 text-2xl">書庫</h1>
        <p className="mt-1 text-sm text-stone-400">
          AI副業の始め方・続け方の攻略記事。運営者自身の実践記録とともに
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="game-card text-center text-sm text-stone-500">
          書物はまだ棚に並んでいません。近日、最初の一冊が収められます。
        </p>
      ) : (
        <ul className="space-y-3">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/articles/${a.slug}`}
                className="game-card block space-y-1 transition-colors hover:border-gold/40"
              >
                <p className="text-base font-semibold text-stone-100">{a.title}</p>
                <p className="text-xs leading-relaxed text-stone-400">{a.description}</p>
                {a.publishedAt && (
                  <p className="text-[10px] text-stone-600">{formatDate(a.publishedAt)}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-center text-xs text-stone-500">
        <Link href="/" className="text-gold-light hover:underline">
          館の入口へ戻る
        </Link>
      </p>
    </main>
  );
}
