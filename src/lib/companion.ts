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
import { COMPANION_CONFIG } from "@/config/companion";
import { computeSkillTotals, type SkillKey } from "@/lib/skills";

export function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

/** ユーザーの状況を集めてシステムプロンプトを組み立てる */
export async function buildSystemPrompt(userId: string): Promise<string> {
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

  return `あなたの名前は「${companionName}」です。以下はあなたの基本設定です。

${COMPANION_CONFIG.personality}

${EMOTION_TAG_INSTRUCTION}

## 現在の来賓(ユーザー)の状況(この情報を踏まえて文脈のある声かけをすること)
- 名前: ${user.name}
- 位階(レベル): ${user.level}(称号:「${titleForRank(user.level, ranks)}」)
- 累計経験値: ${user.exp}
- 連夜の参加(連続ログイン): ${user.streak?.currentStreak ?? 0}日(自己最長: ${user.streak?.longestStreak ?? 0}日)
- 今宵の使命(デイリーミッション):
${missionLines}
- 技量:
${skillLines}`;
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
export function fallbackGreeting(name: string): string {
  return `お帰りなさいませ、${name}様。今宵も雇われの身の荒波を生き抜いてこられたのですね。さあ、ご自身の力を築くお時間でございます。まずは今宵の使命からいかがでしょうか。`;
}

/**
 * その日初回のみ、状況に応じた挨拶を生成して保存する。
 * すでに今日の挨拶があればそれを返す。
 */
export async function getOrCreateDailyGreeting(userId: string): Promise<string> {
  // 今日すでにコンパニオンからのメッセージがあれば挨拶済みとみなす
  const existing = await prisma.companionMessage.findFirst({
    where: { userId, role: "assistant", createdAt: { gte: startOfTodayJst() } },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.content;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const client = getAnthropicClient();
  if (!client) return fallbackGreeting(user.name);

  try {
    const system = await buildSystemPrompt(userId);
    const response = await client.messages.create({
      model: COMPANION_CONFIG.model,
      max_tokens: 300,
      system,
      messages: [
        {
          role: "user",
          content:
            "(システム: 来賓が今日はじめて館を訪れました。状況に応じた今宵の挨拶をひとこと生成してください。連夜の参加が続いているなら労い、今宵の使命が未達なら丁重な後押しを。執事口調で2〜3文。)",
        },
      ],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");

    if (!text) return fallbackGreeting(user.name);

    await saveMessage(userId, "assistant", text);
    return text;
  } catch (e) {
    console.error("greeting generation error:", e);
    return fallbackGreeting(user.name);
  }
}
