// 未ログイン来賓を識別するための匿名ID(Cookie)。いいね機能などで使用する
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const ANON_ID_COOKIE = "reversal_anon_id";

/** anonId Cookie発行時の共通オプション(本番ではsecure属性を付与) */
export const ANON_ID_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
};

/** 閲覧者の識別情報。ログイン中はuserId、未ログインはCookie発行のanonIdでいいねなどを判定する */
export type Viewer = { userId?: string; anonId?: string };

/** 既存のanonId Cookieを読むだけ(発行はしない) */
export function readAnonId(): string | undefined {
  return cookies().get(ANON_ID_COOKIE)?.value;
}

/** anonId Cookieが無ければ新規発行して返す。レスポンス側でのCookie設定は呼び出し元で行う */
export function getOrCreateAnonId(): { anonId: string; isNew: boolean } {
  const existing = readAnonId();
  if (existing) return { anonId: existing, isNew: false };
  return { anonId: randomUUID(), isNew: true };
}
