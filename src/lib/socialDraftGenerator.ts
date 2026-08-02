// X投稿ローテーション(docs/revenue-plan.mdの表と同じ内容)に基づき、Claudeで告知文の下書きを1件生成する。
// 生成のみを自動化し、実際の外部公開は管理画面での人間の最終確認を経て行う(意図的に分離)
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/siteUrl";
import { todayJst } from "@/lib/date";

const ROTATION: Record<number, { type: string; path: string; angle: string }> = {
  1: { type: "診断コンテンツ訴求", path: "/diagnosis", angle: "週明けの「何か始めよう」需要を拾う" },
  2: { type: "体験ページ(ゲーミフィケーション)", path: "/experience", angle: "平日の空き時間に触ってもらう軽めの導線" },
  3: { type: "収益シミュレーター(正直な数字)", path: "/simulator", angle: "週半ばの「本当に稼げるの?」という迷いに正直な数字で応える" },
  4: { type: "プロフカード作成ツール", path: "/profile-card", angle: "ビジュアル系はリツイート・引用されやすいので拡散狙い" },
  5: { type: "差別化(誠実さ)フック", path: "/", angle: "週末前、感情に訴える強めのメッセージ" },
  6: { type: "短文・好奇心フック", path: "/", angle: "土日は文字を読む気力が下がるので短文で軽く流す" },
  0: { type: "週次まとめ(実況ログ)", path: "/board", angle: "その週の実データで信頼を積み上げる、次週への布石" },
};

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

async function buildWeeklySummaryFacts(): Promise<string> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const posts = await prisma.post.findMany({
    where: { createdAt: { gte: weekAgo } },
    select: { title: true, revenueAmount: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  if (posts.length === 0) return "直近1週間の掲示板投稿はありません。";
  const lines = posts.map((p) => {
    const rev = p.revenueAmount != null ? `(${p.revenueAmount.toLocaleString()}円)` : "";
    return `- ${p.title}${rev}`;
  });
  return `直近1週間の掲示板投稿(${posts.length}件):\n${lines.join("\n")}`;
}

export type DraftGenerationResult = { bodyText: string } | { error: string };

/**
 * "YYYY-MM-DD"の曜日を求める。new Date(str).getDay()は実行環境のローカルタイムゾーンで
 * 曜日を割り出すため、UTCで動くVercel本番では1日ズレる(ローカルWindowsはJST設定なので気づけなかった)。
 * Date.UTC+getUTCDay()を使うことで、実行環境のタイムゾーンに依存せず正しい曜日を求める
 */
function dayOfWeekOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export async function generateRotationDraft(): Promise<DraftGenerationResult> {
  const client = getAnthropicClient();
  if (!client) return { error: "ANTHROPIC_API_KEYが設定されていません" };

  const today = todayJst();
  const dow = dayOfWeekOf(today);
  const entry = ROTATION[dow];
  const url = `${SITE_URL}${entry.path}`;

  const isSunday = dow === 0;
  const facts = isSunday ? await buildWeeklySummaryFacts() : null;

  const prompt = `あなたはREVERSAL(AI副業ゲーミフィケーションコミュニティサイト)のX投稿担当です。
以下の条件で、今日の投稿タイプに沿った告知文を1つ作ってください。

投稿タイプ: ${entry.type}
狙い: ${entry.angle}
誘導先URL: ${url}

条件:
- 文体は誇張禁止・実況型(「稼げます」「絶対に」等の断定的な誘い文句は使わない)
- 280字以内(URLの文字数も含めて)
- 最後にURLを1行で入れる
- ハッシュタグは多くても1〜2個まで
${isSunday && facts ? `- 週次まとめの回なので、以下の実データを使って具体的に書くこと:\n${facts}` : ""}

投稿本文だけを出力してください(前置きや説明は不要)。`;

  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!text) return { error: "生成結果が空でした" };
  return { bodyText: text };
}
