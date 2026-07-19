// 書庫(攻略記事)のサーバーサイドロジック
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { marked } from "marked";
import { moderateText } from "@/lib/moderation";
import type { Viewer } from "@/lib/anonId";

/** 公開済み記事の一覧(新しい順)。categoryを指定するとその区分のみ返す */
export async function getPublishedArticles(category?: "guide" | "novel") {
  return prisma.article.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, description: true, publishedAt: true, category: true },
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

/** 記事のスラッグを自動生成する(手入力は廃止)。衝突時は呼び出し側でリトライする */
export function generateArticleSlug(category: string): string {
  return `${category}-${randomUUID().slice(0, 8)}`;
}

/**
 * 説明文が未入力の記事(主に攻略記事)向けに、本文からMarkdown記法を除いた
 * 冒頭テキストを検索結果・OGP用の説明文として自動生成する
 */
export function deriveDescriptionFromContent(content: string, maxLen = 150): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : plain;
}

/** 記事・小説への「いいね」状態(件数・自分が押しているか)を取得する */
export async function getArticleLikeState(viewer: Viewer, articleId: string) {
  const [likeCount, likedByMe] = await Promise.all([
    prisma.articleLike.count({ where: { articleId } }),
    viewer.userId
      ? prisma.articleLike
          .findUnique({ where: { articleId_userId: { articleId, userId: viewer.userId } } })
          .then((r) => !!r)
      : viewer.anonId
        ? prisma.articleLike
            .findUnique({ where: { articleId_anonId: { articleId, anonId: viewer.anonId } } })
            .then((r) => !!r)
        : Promise.resolve(false),
  ]);
  return { likeCount, likedByMe };
}

/** 記事・小説への「いいね」をトグルする。未ログインならanonIdで判定する */
export async function toggleArticleLike(
  viewer: Viewer,
  articleId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const existing = viewer.userId
    ? await prisma.articleLike.findUnique({
        where: { articleId_userId: { articleId, userId: viewer.userId } },
      })
    : await prisma.articleLike.findUnique({
        where: { articleId_anonId: { articleId, anonId: viewer.anonId! } },
      });

  if (existing) {
    await prisma.articleLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.articleLike.create({
      data: { articleId, userId: viewer.userId, anonId: viewer.anonId },
    });
  }

  const likeCount = await prisma.articleLike.count({ where: { articleId } });
  return { liked: !existing, likeCount };
}

export type ArticleCommentItem = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
};

/** 記事・小説へのコメント一覧(古い順) */
export async function getArticleComments(articleId: string): Promise<ArticleCommentItem[]> {
  const comments = await prisma.articleComment.findMany({
    where: { articleId },
    orderBy: { createdAt: "asc" },
    select: { id: true, authorName: true, content: true, createdAt: true },
  });
  return comments;
}

export type CreateArticleCommentResult =
  | { ok: true; comment: ArticleCommentItem }
  | { ok: false; reason: "rejected"; message: string };

/**
 * 記事・小説にコメントする(未ログイン可)。
 * ログイン中は本人のアカウント名を使用し、表示名のなりすましを防ぐ。未ログインは任意入力(空欄なら「匿名の来賓」)
 */
export async function createArticleComment(
  viewer: Viewer,
  articleId: string,
  input: { authorName?: string; content: string }
): Promise<CreateArticleCommentResult> {
  const moderation = await moderateText(input.content);
  if (!moderation.allowed) {
    return { ok: false, reason: "rejected", message: moderation.reason! };
  }

  let authorName = input.authorName?.trim() || "匿名の来賓";
  if (viewer.userId) {
    const user = await prisma.user.findUnique({ where: { id: viewer.userId }, select: { name: true } });
    authorName = user?.name ?? authorName;
  }

  const comment = await prisma.articleComment.create({
    data: {
      articleId,
      userId: viewer.userId,
      anonId: viewer.userId ? null : viewer.anonId,
      authorName,
      content: input.content,
    },
    select: { id: true, authorName: true, content: true, createdAt: true },
  });

  return { ok: true, comment };
}
