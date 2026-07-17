// AIコンパニオン(執事)のサーバーサイドロジック
// - ユーザー状況をシステムプロンプトへ動的注入
// - 会話履歴の取得・保存
// - 1日あたりのメッセージ数レート制限
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { todayJst, startOfTodayJst } from "@/lib/date";
import { titleForRank } from "@/lib/rankTitle";
import { getRanks } from "@/lib/ranks";
import { SKILL_LABELS } from "@/lib/missions";
import { getTodaysMissions } from "@/lib/dailyMissions";
import { getSiteText } from "@/lib/siteText";
import { EMOTION_TAG_INSTRUCTION } from "@/lib/companionEmotion";
import { SITE_POLICY } from "@/lib/sitePolicy";
import { COMPANION_CONFIG } from "@/config/companion";
import { computeSkillTotals, type SkillKey } from "@/lib/skills";

export function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export type SystemPromptParts = {
  /** 全ユーザー・全リクエストで共通の固定文言(プロンプトキャッシュの対象) */
  stable: string;
  /** ユーザーごとに変動する状況(キャッシュ対象外、末尾に付与する) */
  dynamic: string;
};

/**
 * ユーザーの状況を集めてシステムプロンプトを組み立てる。
 * 固定文言(stable)と可変文言(dynamic)を分けて返すことで、
 * 呼び出し側で stable に cache_control を付けてプロンプトキャッシュを効かせられるようにする。
 */
export async function buildSystemPrompt(userId: string): Promise<SystemPromptParts> {
  const today = todayJst();
  const [user, completions, missions, ranks, companionName, skills] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { streak: true },
    }),
    prisma.missionCompletion.findMany({
      where: { userId, completedDate: today },
      select: { missionId: true },
    }),
    getTodaysMissions(today),
    getRanks(),
    getSiteText("companion.name"),
    computeSkillTotals(userId),
  ]);

  const completedIds = new Set(completions.map((c) => c.missionId));
  const missionLines = missions
    .map((m) => `- ${m.title}: ${completedIds.has(m.id) ? "達成済み" : "未達成"}`)
    .join("\n");

  const skillLines = (Object.keys(SKILL_LABELS) as SkillKey[])
    .map((key) => `- ${SKILL_LABELS[key]}: ${skills[key]}/100`)
    .join("\n");

  const stable = `あなたの名前は「${companionName}」です。以下はあなたの基本設定です。

${COMPANION_CONFIG.personality}

${SITE_POLICY}

${EMOTION_TAG_INSTRUCTION}`;

  const dynamic = `## 現在の来賓(ユーザー)の状況(この情報を踏まえて文脈のある声かけをすること)
- 名前: ${user.name}
- 位階(レベル): ${user.level}(称号:「${titleForRank(user.level, ranks)}」)
- 累計経験値: ${user.exp}
- 連夜の参加(連続ログイン): ${user.streak?.currentStreak ?? 0}日(自己最長: ${user.streak?.longestStreak ?? 0}日)
- 今宵の使命(デイリーミッション):
${missionLines}
- 技量:
${skillLines}`;

  return { stable, dynamic };
}

/**
 * LP向け「お試しチャット」用のシステムプロンプト(未登録来訪者向け)。
 * 位階・使命など来賓固有の状態は存在しないため、buildSystemPrompt とは別に用意する。
 */
export async function buildTrialSystemPrompt(): Promise<string> {
  const companionName = await getSiteText("companion.name");

  return `あなたの名前は「${companionName}」です。以下はあなたの基本設定です。

${COMPANION_CONFIG.personality}

${SITE_POLICY}

${EMOTION_TAG_INSTRUCTION}

## 現在の状況(重要)
話しかけているのは、まだ会員登録をしていない「訪問者」です(来賓ではありません)。位階・使命・技量などの情報は一切存在しないため、それらに言及したり尋ねたりしないでください。副業の悩みや疑問に短く実務的に答えつつ、執事としての人格を保ってください。何度かのやり取りの中で一度だけ、押し付けがましくなく、登録すれば継続支援が受けられる旨を自然に伝えてください。`;
}

/** 匿名来訪者(anonId単位)の「お試しチャット」利用回数を取得する */
export async function countTrialMessages(anonId: string): Promise<number> {
  const row = await prisma.anonCompanionUsage.findUnique({ where: { anonId } });
  return row?.count ?? 0;
}

/** 匿名来訪者の利用回数を1件加算する */
export async function incrementTrialMessages(anonId: string): Promise<void> {
  await prisma.anonCompanionUsage.upsert({
    where: { anonId },
    create: { anonId, count: 1 },
    update: { count: { increment: 1 } },
  });
}

/** buildSystemPrompt の結果を、プロンプトキャッシュ用の system ブロック配列に変換する */
export function toSystemBlocks(parts: SystemPromptParts): Anthropic.Messages.TextBlockParam[] {
  return [
    { type: "text", text: parts.stable, cache_control: { type: "ephemeral" } },
    { type: "text", text: parts.dynamic },
  ];
}

/** 今日送信済みのユーザーメッセージ数(レート制限用) */
export async function countTodayUserMessages(userId: string): Promise<number> {
  return prisma.companionMessage.count({
    where: { userId, role: "user", createdAt: { gte: startOfTodayJst() } },
  });
}

/** チャットコンテキスト用の直近履歴(古い順) */
export async function getRecentMessages(userId: string) {
  const messages = await prisma.companionMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: COMPANION_CONFIG.contextExchanges * 2,
  });
  return messages.reverse();
}

export async function saveMessage(userId: string, role: "user" | "assistant", content: string) {
  return prisma.companionMessage.create({ data: { userId, role, content } });
}

/** APIキー未設定・エラー時のフォールバック挨拶 */
export function fallbackGreeting(name: string, isFirstEver = false): string {
  if (isFirstEver) {
    return `はじめまして、${name}様。私、この洋館で秘書兼執事を務めております、クロエと申します。以後、${name}様の副業の歩みに寄り添わせていただきますので、何なりとお申し付けくださいませ。`;
  }
  return `お帰りなさいませ、${name}様。今宵も雇われの身の荒波を生き抜いてこられたのですね。さあ、ご自身の力を築くお時間でございます。まずは今宵の使命からいかがでしょうか。`;
}

/**
 * その日初回のみ、状況に応じた挨拶を生成して保存する。
 * すでに今日の挨拶があればそれを返す。会員登録後はじめての挨拶生成の場合は、自己紹介を含めた挨拶にする。
 */
export async function getOrCreateDailyGreeting(userId: string): Promise<string> {
  // 今日すでにコンパニオンからのメッセージがあれば挨拶済みとみなす
  const existing = await prisma.companionMessage.findFirst({
    where: { userId, role: "assistant", createdAt: { gte: startOfTodayJst() } },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.content;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const isFirstEver =
    (await prisma.companionMessage.count({ where: { userId, role: "assistant" } })) === 0;

  const client = getAnthropicClient();
  if (!client) return fallbackGreeting(user.name, isFirstEver);

  try {
    const systemParts = await buildSystemPrompt(userId);
    const instruction = isFirstEver
      ? `(システム: 来賓「${user.name}様」が、たった今はじめてこの館を訪れ、あなたと初めて顔を合わせます。まずあなた自身の名前と役割を簡潔に名乗ってから、歓迎の言葉をかけてください。この挨拶は今日一日そのまま表示され続けるため、今宵の使命の達成状況など、これから来賓の行動によって変わりうる事柄には具体的に言及しないこと。執事口調で3〜4文。)`
      : "(システム: 来賓が今日はじめて館を訪れました。状況に応じた今宵の挨拶をひとこと生成してください。連夜の参加が続いているなら労いを。この挨拶は今日一日そのまま表示され続けるため、今宵の使命の達成状況など、これから来賓の行動によって変わりうる事柄には具体的に言及しないこと(例:「使命はまだ白紙」「未達ですね」等は禁止)。執事口調で2〜3文。)";

    const response = await client.messages.create({
      model: COMPANION_CONFIG.model,
      max_tokens: 300,
      system: toSystemBlocks(systemParts),
      messages: [{ role: "user", content: instruction }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    if (!text) return fallbackGreeting(user.name, isFirstEver);

    await saveMessage(userId, "assistant", text);
    return text;
  } catch (e) {
    console.error("greeting generation error:", e);
    return fallbackGreeting(user.name, isFirstEver);
  }
}
