// GA4の直近28日間サマリーをターミナルに表示するスクリプト。
// 実況ログ・記事の数字を確認したい時や、週次まとめのX投稿を書く時の参考値取得に使う。
//
// 使い方:
//   node --env-file=.env.local scripts/fetch-ga4-summary.mjs
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GA4_PROPERTY_ID;
const keyBase64 = process.env.GA4_SERVICE_ACCOUNT_JSON_BASE64;

if (!propertyId || !keyBase64) {
  console.error(
    "GA4_PROPERTY_ID / GA4_SERVICE_ACCOUNT_JSON_BASE64 が未設定です。.env.exampleの手順を参照してください。",
  );
  process.exit(1);
}

const credentials = JSON.parse(Buffer.from(keyBase64, "base64").toString("utf-8"));
const client = new BetaAnalyticsDataClient({ credentials });

const [totals] = await client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
  metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
});

const row = totals.rows?.[0];
const activeUsers = row?.metricValues?.[0]?.value ?? "0";
const sessions = row?.metricValues?.[1]?.value ?? "0";
const screenPageViews = row?.metricValues?.[2]?.value ?? "0";

console.log("過去28日間のGA4サマリー");
console.log(`  ユーザー数: ${activeUsers}`);
console.log(`  セッション数: ${sessions}`);
console.log(`  PV数: ${screenPageViews}`);
