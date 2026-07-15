// 書庫(攻略記事)のサーバーサイドロジック
import { prisma } from "@/lib/prisma";
import { marked } from "marked";

/** 公開済み記事の一覧(新しい順) */
export async function getPublishedArticles() {
  return prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, description: true, publishedAt: true },
  });
}

/** 公開済み記事をスラッグで1件取得する */
export async function getPublishedArticle(slug: string) {
  return prisma.article.findFirst({ where: { slug, published: true } });
}

/**
 * Markdown本文をHTMLへ変換する。
 * 記事は管理者のみが書ける前提のため、入力は信頼できるものとして扱う
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false, breaks: true, gfm: true });
}
