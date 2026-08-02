// X(旧Twitter) API v2への投稿ロジック。OAuth 1.0aのユーザーコンテキスト認証で
// アプリ所有者(REVERSAL運営)自身のアカウントに投稿する
import { TwitterApi } from "twitter-api-v2";

export function getXClient(): TwitterApi | null {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) return null;
  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken,
    accessSecret,
  });
}

export async function postTweet(text: string): Promise<{ id: string }> {
  const client = getXClient();
  if (!client) throw new Error("X APIの認証情報が設定されていません");
  const result = await client.v2.tweet(text);
  return { id: result.data.id };
}
