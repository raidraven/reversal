// メール送信(Resend)。RESEND_API_KEY未設定時は送信をスキップし、コンソールにログするだけ(開発用フォールバック)
import { Resend } from "resend";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

const FROM_ADDRESS = process.env.EMAIL_FROM || "リバーサル <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const client = getResendClient();
  if (!client) {
    console.warn(
      `[email] RESEND_API_KEY未設定のため送信をスキップしました。本来は ${to} 宛に以下のURLを送信します:\n${resetUrl}`
    );
    return;
  }

  await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "【リバーサル】パスワード再設定のご案内",
    text: `扉の前で、あなたをお待ちしております。\n\n以下のリンクからパスワードを再設定してください(1時間有効です)。\n\n${resetUrl}\n\nこのメールに心当たりが無い場合は、破棄していただいて構いません。`,
  });
}
