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

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** ADMIN_EMAILS環境変数(カンマ区切り)宛に、X投稿の下書きが自動生成されたことを通知する */
export async function sendSocialDraftGeneratedEmail(input: {
  bodyText: string;
  adminUrl: string;
  approveUrl: string;
  rejectUrl: string;
}): Promise<void> {
  const { bodyText, adminUrl, approveUrl, rejectUrl } = input;
  const to = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (to.length === 0) return;

  const client = getResendClient();
  if (!client) {
    console.warn(`[email] RESEND_API_KEY未設定のため送信をスキップしました。宛先: ${to.join(", ")}`);
    return;
  }

  await client.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "【リバーサル】X投稿の下書きができました",
    text: `今日のX投稿ローテーションに沿った下書きが自動生成されました。\n\n---\n${bodyText}\n---\n\n承認して投稿: ${approveUrl}\n却下(投稿しない): ${rejectUrl}\n\n内容を編集したい場合は管理画面から: ${adminUrl}\n\n(承認・却下のリンクは1回しか使えません)`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0a0708; color: #f5f0e8;">
        <p style="font-size: 12px; letter-spacing: 3px; color: #c9a24d; text-transform: uppercase;">REVERSAL</p>
        <p style="font-size: 14px; line-height: 1.7;">今日のX投稿ローテーションに沿った下書きが自動生成されました。</p>
        <div style="margin: 16px 0; padding: 16px; border: 1px solid #c9a24d40; border-radius: 12px; background: #160f11; white-space: pre-wrap; font-size: 14px; line-height: 1.7;">${escapeHtml(bodyText)}</div>
        <table role="presentation" style="width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding-right: 8px;">
              <a href="${approveUrl}" style="display: block; text-align: center; padding: 12px 16px; background: #c9a24d; color: #0a0708; font-weight: bold; text-decoration: none; border-radius: 8px;">承認して投稿</a>
            </td>
            <td style="padding-left: 8px;">
              <a href="${rejectUrl}" style="display: block; text-align: center; padding: 12px 16px; border: 1px solid #7d2438; color: #f5f0e8; text-decoration: none; border-radius: 8px;">却下</a>
            </td>
          </tr>
        </table>
        <p style="font-size: 12px; color: #8a7a6a;">内容を編集したい場合は<a href="${adminUrl}" style="color: #c9a24d;">管理画面</a>から。上のリンクは1回しか使えません。</p>
      </div>
    `,
  });
}
