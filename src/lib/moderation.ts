// 投稿コンテンツの自動モデレーション
// Claude Haiku(軽量・高速)で判定する。APIキー未設定時や判定失敗時はフェイルオープン
// (投稿を許可する)— この館は非商用の小規模コミュニティであるため、可用性を優先する設計
import { getAnthropicClient } from "@/lib/companion";

const MODERATION_MODEL = "claude-haiku-4-5";

export type ModerationResult = { allowed: boolean; reason?: string };

const MODERATION_SYSTEM_PROMPT = `あなたはコミュニティサイトのコンテンツモデレーターです。
これから渡されるユーザー投稿が、以下のいずれかに該当するかを判定してください。

- 誹謗中傷・ハラスメント・差別的な表現
- 個人情報の暴露(実名・住所・電話番号・メールアドレス等)
- スパム・宣伝・出会い系等の勧誘
- 違法行為(詐欺・薬物・マルチ商法等)の勧誘や助長
- 過度に性的・暴力的な表現

該当する場合は "REJECT"、どれにも該当しない場合は "ALLOW" とだけ出力してください。
説明・前置き・記号など、それ以外の文字は一切出力しないでください。`;

/** 投稿内容をモデレーションする。判定不能時は許可扱い(フェイルオープン) */
export async function moderateText(text: string): Promise<ModerationResult> {
  const client = getAnthropicClient();
  if (!client) return { allowed: true };

  try {
    const response = await client.messages.create({
      model: MODERATION_MODEL,
      max_tokens: 10,
      system: MODERATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const verdict = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim()
      .toUpperCase();

    if (verdict.startsWith("REJECT")) {
      return {
        allowed: false,
        reason: "内容に問題がある可能性があるため、投稿できませんでした。表現を見直してもう一度お試しください。",
      };
    }
    return { allowed: true };
  } catch (e) {
    console.error("moderation error:", e);
    return { allowed: true };
  }
}
