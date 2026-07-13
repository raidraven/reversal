// 一問一答(QnA)のサーバーサイドロジック
// - 質問は最新の1件が「今宵の問い」として表示される
// - 誰もその日に質問を立てていなければ、表示時にAIが自動出題する(A-1)
// - 質問・回答は投稿前にモデレーションを通す(B-4)
// - 回答は早い順にrank/EXPが決まる(速答ボーナス)
import { prisma } from "@/lib/prisma";
import { levelFromExp } from "@/lib/leveling";
import { getAnthropicClient } from "@/lib/companion";
import { getSiteText } from "@/lib/siteText";
import { moderateText } from "@/lib/moderation";
import { todayJst, toJstDateString } from "@/lib/date";
import type { Viewer } from "@/lib/anonId";
import { isBanned } from "@/lib/bans";

// 短文かつ低クリエイティブ要求(定型の問い出題)のため、コンパニオン会話本体より軽量なモデルを使う
const QUESTION_GENERATION_MODEL = "claude-haiku-4-5";

// 回答の着順ごとのEXP(1着=50, 2着=35, ... 5着以降は一律8)
const ANSWER_XP_TIERS = [50, 35, 25, 15, 8];

function xpForRank(rank: number): number {
  return ANSWER_XP_TIERS[rank - 1] ?? ANSWER_XP_TIERS[ANSWER_XP_TIERS.length - 1];
}

// AI自動出題のフォールバック(APIキー未設定・生成失敗時に使う)
const FALLBACK_QUESTIONS = [
  "今夜、あなたが最も反転させたいと願うものは何ですか?",
  "最近、AIツールを使っていて驚いたことは何ですか?",
  "副業を続ける上で、あなたを支えている習慣はありますか?",
  "もし今日から自由に使える1時間があったら、何をしますか?",
  "これまでの中で、一番「反転」を感じた瞬間はいつですか?",
];

function pickFallbackQuestion(): string {
  return FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
}

async function generateQuestionContent(): Promise<string> {
  const client = getAnthropicClient();
  if (!client) return pickFallbackQuestion();

  try {
    const response = await client.messages.create({
      model: QUESTION_GENERATION_MODEL,
      max_tokens: 150,
      system: `あなたは洋館「リバーサル」に仕える執事です。AI副業に挑戦する来賓たちに向けて、今宵の一問一答のお題となる「問い」をひとつ考えてください。

条件:
- 40文字以内の日本語の問いかけ文で、末尾は「?」
- AI副業・継続・仮面舞踏会の世界観に沿った、来賓同士の会話が弾むような問い
- 説明や前置きは一切書かず、問い本文だけを出力すること`,
      messages: [{ role: "user", content: "今宵の問いを1つ、本文のみで出力してください。" }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    return text || pickFallbackQuestion();
  } catch (e) {
    console.error("question generation error:", e);
    return pickFallbackQuestion();
  }
}

/**
 * 今日まだ誰も質問を立てていなければ、AIが自動で1問出題する(A-1)。
 * 日次の重複生成は aiQuestionDate のユニーク制約で防ぐ(冪等)。
 */
export async function ensureTodaysQuestion(): Promise<void> {
  const today = todayJst();

  const latest = await prisma.question.findFirst({ orderBy: { createdAt: "desc" } });
  if (latest && toJstDateString(latest.createdAt) === today) return;

  const content = await generateQuestionContent();

  try {
    await prisma.question.create({
      data: { content, isAiGenerated: true, aiQuestionDate: today },
    });
  } catch (e: unknown) {
    // 別リクエストが先に今日分を作成済み(競合)なら何もしない
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") return;
    throw e;
  }
}

export type QuestionAnswer = {
  id: string;
  content: string;
  authorName: string;
  rank: number;
  expAwarded: number;
  createdAt: Date;
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
};

export type CurrentQuestion = {
  id: string;
  content: string;
  authorName: string;
  isAiGenerated: boolean;
  createdAt: Date;
  alreadyAnswered: boolean;
  answers: QuestionAnswer[];
};

async function resolveAuthorName(question: {
  authorId: string | null;
  isAiGenerated: boolean;
  author: { name: string } | null;
}): Promise<string> {
  if (question.isAiGenerated) return getSiteText("companion.name");
  return question.author?.name ?? "匿名の来賓";
}

/** 現在の「今宵の問い」(最新の質問)を、指定の閲覧者視点の付随情報つきで取得する(未ログイン可) */
export async function getCurrentQuestion(viewer: Viewer): Promise<CurrentQuestion | null> {
  await ensureTodaysQuestion();

  const question = await prisma.question.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      answers: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true } },
          likes: { select: { userId: true, anonId: true } },
        },
      },
    },
  });
  if (!question) return null;

  return {
    id: question.id,
    content: question.content,
    authorName: await resolveAuthorName(question),
    isAiGenerated: question.isAiGenerated,
    createdAt: question.createdAt,
    alreadyAnswered: !!viewer.userId && question.answers.some((a) => a.authorId === viewer.userId),
    answers: question.answers.map((a) => ({
      id: a.id,
      content: a.content,
      authorName: a.author.name,
      rank: a.rank,
      expAwarded: a.expAwarded,
      createdAt: a.createdAt,
      likeCount: a.likes.length,
      likedByMe: a.likes.some(
        (l) =>
          (!!viewer.userId && l.userId === viewer.userId) ||
          (!!viewer.anonId && l.anonId === viewer.anonId)
      ),
      isMine: !!viewer.userId && a.authorId === viewer.userId,
    })),
  };
}

export type CreateQuestionResult =
  | { ok: true; id: string }
  | { ok: false; reason: "rejected"; message: string }
  | { ok: false; reason: "banned"; message: string };

/** 新しい問いを立てる(以降、これが「今宵の問い」になる) */
export async function createQuestion(userId: string, content: string): Promise<CreateQuestionResult> {
  if (await isBanned(userId)) {
    return { ok: false, reason: "banned", message: "このアカウントは通報により利用停止されています" };
  }

  const moderation = await moderateText(content);
  if (!moderation.allowed) {
    return { ok: false, reason: "rejected", message: moderation.reason! };
  }

  const question = await prisma.question.create({ data: { authorId: userId, content } });
  return { ok: true, id: question.id };
}

export type QuestionPreview = {
  content: string;
  authorName: string;
  isAiGenerated: boolean;
  answerCount: number;
} | null;

/** 未ログインのランディングページ向け:問いの本文のみを返す(回答内容は含めない) */
export async function getCurrentQuestionPreview(): Promise<QuestionPreview> {
  await ensureTodaysQuestion();

  const question = await prisma.question.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      _count: { select: { answers: true } },
    },
  });
  if (!question) return null;

  return {
    content: question.content,
    authorName: await resolveAuthorName(question),
    isAiGenerated: question.isAiGenerated,
    answerCount: question._count.answers,
  };
}

export type SubmitAnswerResult =
  | { ok: true; rank: number; expGained: number; leveledUp: boolean; newLevel: number }
  | { ok: false; reason: "not_found" | "already_answered" }
  | { ok: false; reason: "rejected"; message: string }
  | { ok: false; reason: "banned"; message: string };

/** 問いに回答する。着順に応じたEXPを付与する */
export async function submitAnswer(
  userId: string,
  questionId: string,
  content: string
): Promise<SubmitAnswerResult> {
  if (await isBanned(userId)) {
    return { ok: false, reason: "banned", message: "このアカウントは通報により利用停止されています" };
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) return { ok: false, reason: "not_found" };

  const moderation = await moderateText(content);
  if (!moderation.allowed) {
    return { ok: false, reason: "rejected", message: moderation.reason! };
  }

  const existingCount = await prisma.answer.count({ where: { questionId } });
  const rank = existingCount + 1;
  const expAwarded = xpForRank(rank);

  try {
    await prisma.answer.create({
      data: { questionId, authorId: userId, content, rank, expAwarded },
    });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return { ok: false, reason: "already_answered" };
    }
    throw e;
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const newExp = user.exp + expAwarded;
  const newLevel = levelFromExp(newExp);
  const leveledUp = newLevel > user.level;

  await prisma.user.update({ where: { id: userId }, data: { exp: newExp, level: newLevel } });

  return { ok: true, rank, expGained: expAwarded, leveledUp, newLevel };
}

/** 回答への「いいね」をトグルする(送信済みなら取り消す)。未ログインならanonIdで判定する */
export async function toggleLike(
  viewer: Viewer,
  answerId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const existing = viewer.userId
    ? await prisma.answerLike.findUnique({
        where: { answerId_userId: { answerId, userId: viewer.userId } },
      })
    : await prisma.answerLike.findUnique({
        where: { answerId_anonId: { answerId, anonId: viewer.anonId! } },
      });

  if (existing) {
    await prisma.answerLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.answerLike.create({
      data: { answerId, userId: viewer.userId, anonId: viewer.anonId },
    });
  }

  const likeCount = await prisma.answerLike.count({ where: { answerId } });
  return { liked: !existing, likeCount };
}

/**
 * ログイン(会員登録直後の自動ログインを含む)時に、匿名ID(Cookie)で付けたいいねを
 * そのユーザーの正式ないいねへ引き継ぐ。同じ回答に既に会員としてのいいねがある場合は
 * 二重カウントを避けるため匿名側を捨てる。
 */
export async function mergeAnonLikesIntoUser(userId: string, anonId: string): Promise<void> {
  const anonLikes = await prisma.answerLike.findMany({ where: { anonId } });

  for (const like of anonLikes) {
    const existing = await prisma.answerLike.findUnique({
      where: { answerId_userId: { answerId: like.answerId, userId } },
    });

    if (existing) {
      await prisma.answerLike.delete({ where: { id: like.id } });
    } else {
      await prisma.answerLike.update({
        where: { id: like.id },
        data: { userId, anonId: null },
      });
    }
  }
}
