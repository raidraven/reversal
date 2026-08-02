import { randomBytes } from "crypto";

/** メール内の承認/却下リンク用ワンタイムトークンを生成する(URL安全な文字列) */
export function generateDraftToken(): string {
  return randomBytes(24).toString("base64url");
}
