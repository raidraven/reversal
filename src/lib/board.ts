// 談話室(副業初心者の情報共有掲示板)のサーバーサイドロジック
// - 実績報告・学び・ツール活用のコツの3カテゴリ
// - 投稿・コメントは未ログインでも可能(表示名は自由入力、モデレーション対象)
import { prisma } from "@/lib/prisma";
import { levelFromExp } from "@/lib/leveling";
import { moderateText } from "@/lib/moderation";
import { startOfTodayJst } from "@/lib/date";
import { isBanned } from "@/lib/bans";
import type { Viewer } from "@/lib/anonId";
import { isPostCategory, type PostCategory } from "@/lib/boardCategories";

/** 投稿1件あたりの固定EXP報酬(ログイン投稿のみ)。同日の付与は1回まで(連投によるファーミング防止) */
export const POST_EXP_REWARD = 20;

/** 異なる通報者から計この件数以上通報されると、投稿者アカウントが自動的に追放される */
export const REPORT_BAN_THRESHOLD = 3;

const ANONYMOUS_LABEL = "匿名の来賓";

export type PostItem = {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  revenueAmount: number | null;
  authorName: string;
  authorIsAdmin: boolean;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  isMine: boolean;
  reportedByMe: boolean;
};

/** 談話室の投稿一覧を取得する(未ログイン可)。categoryを指定するとそのカテゴリのみ */
export async function getPosts(viewer: Viewer, category?: PostCategory): Promise<PostItem[]> {
  const posts = await prisma.post.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, isAdmin: true } },
      likes: { select: { userId: true, anonId: true } },
      comments: { select: { id: true } },
      reports: viewer.userId ? { where: { reporterId: viewer.userId }, select: { id: true } } : false,
    },
  });

  return posts.map((p) => ({
    id: p.id,
    category: isPostCategory(p.category) ? p.category : "tip",
    title: p.title,
    content: p.content,
    revenueAmount: p.revenueAmount,
    authorName: p.author?.name ?? p.authorName ?? ANONYMOUS_LABEL,
    authorIsAdmin: p.author?.isAdmin ?? false,
    createdAt: p.createdAt,
    likeCount: p.likes.length,
    likedByMe: p.likes.some(
      (l) =>
        (!!viewer.userId && l.userId === viewer.userId) ||
        (!!viewer.anonId && l.anonId === viewer.anonId)
    ),
    commentCount: p.comments.length,
    isMine:
      (!!viewer.userId && p.authorId === viewer.userId) ||
      (!!viewer.anonId && p.anonId === viewer.anonId),
    reportedByMe: Array.isArray(p.reports) && p.reports.length > 0,
  }));
}

export type CreatePostResult =
  | { ok: true; id: string; expGained: number; leveledUp: boolean; newLevel: number }
  | { ok: false; reason: "rejected"; message: string }
  | { ok: false; reason: "banned"; message: string };

/**
 * 談話室に投稿する(未ログイン可)。
 * ログイン投稿は何度でもできるが、EXP付与は1日1回まで(連投でのEXPファーミングを防ぐため)。
 * 未ログイン投稿はEXP付与の対象外。
 */
export async function createPost(
  viewer: Viewer,
  input: { category: PostCategory; title: string; content: string; revenueAmount?: number; authorName?: string }
): Promise<CreatePostResult> {
  if (viewer.userId && (await isBanned(viewer.userId))) {
    return { ok: false, reason: "banned", message: "このアカウントは通報により利用停止されています" };
  }

  const moderation = await moderateText(`${input.title}\n${input.content}`);
  if (!moderation.allowed) {
    return { ok: false, reason: "rejected", message: moderation.reason! };
  }

  if (!viewer.userId) {
    const post = await prisma.post.create({
      data: {
        anonId: viewer.anonId,
        authorName: input.authorName?.trim() || ANONYMOUS_LABEL,
        category: input.category,
        title: input.title,
        content: input.content,
        revenueAmount: input.revenueAmount ?? null,
      },
    });
    return { ok: true, id: post.id, expGained: 0, leveledUp: false, newLevel: 0 };
  }

  const todaysPostCount = await prisma.post.count({
    where: { authorId: viewer.userId, createdAt: { gte: startOfTodayJst() } },
  });
  const expGained = todaysPostCount === 0 ? POST_EXP_REWARD : 0;

  const post = await prisma.post.create({
    data: {
      authorId: viewer.userId,
      category: input.category,
      title: input.title,
      content: input.content,
      revenueAmount: input.revenueAmount ?? null,
    },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: viewer.userId } });
  const newExp = user.exp + expGained;
  const newLevel = levelFromExp(newExp);
  const leveledUp = newLevel > user.level;

  if (expGained > 0) {
    await prisma.user.update({ where: { id: viewer.userId }, data: { exp: newExp, level: newLevel } });
  }

  return { ok: true, id: post.id, expGained, leveledUp, newLevel };
}

/** 投稿への「いいね」をトグルする(送信済みなら取り消す)。未ログインならanonIdで判定する */
export async function togglePostLike(
  viewer: Viewer,
  postId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const existing = viewer.userId
    ? await prisma.postLike.findUnique({
        where: { postId_userId: { postId, userId: viewer.userId } },
      })
    : await prisma.postLike.findUnique({
        where: { postId_anonId: { postId, anonId: viewer.anonId! } },
      });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({
      data: { postId, userId: viewer.userId, anonId: viewer.anonId },
    });
  }

  const likeCount = await prisma.postLike.count({ where: { postId } });
  return { liked: !existing, likeCount };
}

/** ログイン時に、匿名ID(Cookie)で付けた投稿へのいいねを会員アカウントへ引き継ぐ */
export async function mergeAnonPostLikesIntoUser(userId: string, anonId: string): Promise<void> {
  const anonLikes = await prisma.postLike.findMany({ where: { anonId } });

  for (const like of anonLikes) {
    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: like.postId, userId } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: like.id } });
    } else {
      await prisma.postLike.update({
        where: { id: like.id },
        data: { userId, anonId: null },
      });
    }
  }
}

export type PostCommentItem = {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
};

/** 投稿へのコメント一覧(古い順) */
export async function getPostComments(postId: string): Promise<PostCommentItem[]> {
  return prisma.postComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: { id: true, authorName: true, content: true, createdAt: true },
  });
}

export type CreatePostCommentResult =
  | { ok: true; comment: PostCommentItem }
  | { ok: false; reason: "rejected"; message: string };

/**
 * 投稿にコメントする(未ログイン可)。
 * ログイン中はなりすまし防止のため本人のアカウント名を使用し、未ログインのみ任意の表示名を入力できる
 */
export async function createPostComment(
  viewer: Viewer,
  postId: string,
  input: { authorName?: string; content: string }
): Promise<CreatePostCommentResult> {
  const moderation = await moderateText(input.content);
  if (!moderation.allowed) {
    return { ok: false, reason: "rejected", message: moderation.reason! };
  }

  let authorName = input.authorName?.trim() || ANONYMOUS_LABEL;
  if (viewer.userId) {
    const user = await prisma.user.findUnique({ where: { id: viewer.userId }, select: { name: true } });
    authorName = user?.name ?? authorName;
  }

  const comment = await prisma.postComment.create({
    data: {
      postId,
      userId: viewer.userId,
      anonId: viewer.userId ? null : viewer.anonId,
      authorName,
      content: input.content,
    },
    select: { id: true, authorName: true, content: true, createdAt: true },
  });

  return { ok: true, comment };
}

export type ReportPostResult =
  | { ok: true; alreadyReported: false; authorBanned: boolean }
  | { ok: true; alreadyReported: true; authorBanned: boolean }
  | { ok: false; reason: "not_found" };

/**
 * 投稿を通報する(要ログイン・同一投稿への重複通報は不可)。
 * 投稿者が異なる通報者から計 REPORT_BAN_THRESHOLD 件以上通報されたら、投稿者アカウントを自動追放する。
 * 投稿者が未ログイン(匿名)の場合はアカウントが存在しないため、追放処理は行わない。
 */
export async function reportPost(reporterId: string, postId: string): Promise<ReportPostResult> {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) return { ok: false, reason: "not_found" };

  const existing = await prisma.postReport.findUnique({
    where: { postId_reporterId: { postId, reporterId } },
  });
  if (existing) {
    const author = post.authorId
      ? await prisma.user.findUnique({ where: { id: post.authorId }, select: { banned: true } })
      : null;
    return { ok: true, alreadyReported: true, authorBanned: !!author?.banned };
  }

  await prisma.postReport.create({ data: { postId, reporterId } });

  if (!post.authorId) {
    return { ok: true, alreadyReported: false, authorBanned: false };
  }

  // 投稿者の全投稿に対する通報を集計し、通報者の重複を除いた人数で判定する
  // (同一人物が複数の投稿を通報しただけでは追放されないようにするため)
  const reportsAgainstAuthor = await prisma.postReport.findMany({
    where: { post: { authorId: post.authorId } },
    select: { reporterId: true },
  });
  const distinctReporterCount = new Set(reportsAgainstAuthor.map((r) => r.reporterId)).size;

  let authorBanned = false;
  if (distinctReporterCount >= REPORT_BAN_THRESHOLD) {
    const updated = await prisma.user.update({
      where: { id: post.authorId },
      data: { banned: true, bannedAt: new Date() },
    });
    authorBanned = updated.banned;
  }

  return { ok: true, alreadyReported: false, authorBanned };
}

export type AdminPostItem = {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  revenueAmount: number | null;
  authorName: string;
  authorId: string | null;
  authorBanned: boolean;
  createdAt: Date;
  reportCount: number;
};

/** 管理ページ向け:全投稿を通報件数つきで一覧取得する */
export async function getAllPostsForAdmin(): Promise<AdminPostItem[]> {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, banned: true } },
      reports: { select: { id: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    category: isPostCategory(p.category) ? p.category : "tip",
    title: p.title,
    content: p.content,
    revenueAmount: p.revenueAmount,
    authorName: p.author?.name ?? p.authorName ?? ANONYMOUS_LABEL,
    authorId: p.authorId,
    authorBanned: p.author?.banned ?? false,
    createdAt: p.createdAt,
    reportCount: p.reports.length,
  }));
}

/** 管理ページから投稿を削除する */
export async function deletePost(postId: string): Promise<void> {
  await prisma.post.delete({ where: { id: postId } });
}
