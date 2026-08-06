// GA4 Data API連携。サービスアカウントの認証情報はBase64化したJSONを環境変数で渡す
// (.env.exampleのGA4_SERVICE_ACCOUNT_JSON_BASE64 / GA4_PROPERTY_IDを参照)
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export type Ga4Summary = {
  rangeLabel: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  topPages: { path: string; views: number }[];
};

function isGa4Configured(): boolean {
  return Boolean(process.env.GA4_PROPERTY_ID && process.env.GA4_SERVICE_ACCOUNT_JSON_BASE64);
}

function getClient(): BetaAnalyticsDataClient {
  const json = Buffer.from(process.env.GA4_SERVICE_ACCOUNT_JSON_BASE64 as string, "base64").toString("utf-8");
  const credentials = JSON.parse(json);
  return new BetaAnalyticsDataClient({ credentials });
}

/** 直近28日間のGA4サマリーを取得する。未設定の場合はnullを返す */
export async function getGa4Summary(): Promise<Ga4Summary | null> {
  if (!isGa4Configured()) return null;

  const client = getClient();
  const propertyId = process.env.GA4_PROPERTY_ID as string;

  const [totals, pages] = await Promise.all([
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    }),
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5,
    }),
  ]);

  const totalsRow = totals[0].rows?.[0];
  const activeUsers = Number(totalsRow?.metricValues?.[0]?.value ?? 0);
  const sessions = Number(totalsRow?.metricValues?.[1]?.value ?? 0);
  const screenPageViews = Number(totalsRow?.metricValues?.[2]?.value ?? 0);

  const topPages = (pages[0].rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    views: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  return { rangeLabel: "過去28日間", activeUsers, sessions, screenPageViews, topPages };
}
