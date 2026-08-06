"use client";

import { useEffect, useState } from "react";

type Summary = {
  rangeLabel: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  topPages: { path: string; views: number }[];
};

export function AnalyticsManager() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "取得に失敗しました");
        return;
      }
      setSummary(data.summary);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="h-24 animate-pulse rounded-md bg-surface-raised" />;

  if (error) {
    return (
      <div>
        <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
        <button onClick={load} className="ghost-button mt-3 !px-3 !py-1.5 text-xs">
          再取得
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div>
      <p className="text-xs text-stone-500">{summary.rangeLabel}のGA4データ</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-md border border-surface-border bg-surface-raised p-3 text-center">
          <p className="text-lg font-serif text-gold-light">{summary.activeUsers.toLocaleString()}</p>
          <p className="mt-1 text-[10px] text-stone-500">ユーザー数</p>
        </div>
        <div className="rounded-md border border-surface-border bg-surface-raised p-3 text-center">
          <p className="text-lg font-serif text-gold-light">{summary.sessions.toLocaleString()}</p>
          <p className="mt-1 text-[10px] text-stone-500">セッション数</p>
        </div>
        <div className="rounded-md border border-surface-border bg-surface-raised p-3 text-center">
          <p className="text-lg font-serif text-gold-light">{summary.screenPageViews.toLocaleString()}</p>
          <p className="mt-1 text-[10px] text-stone-500">PV数</p>
        </div>
      </div>

      {summary.topPages.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-stone-500">閲覧数の多いページ</p>
          <ul className="mt-2 space-y-1">
            {summary.topPages.map((p) => (
              <li
                key={p.path}
                className="flex items-center justify-between rounded-md border border-surface-border bg-surface-raised px-3 py-1.5 text-xs"
              >
                <span className="truncate text-stone-300">{p.path}</span>
                <span className="ml-2 shrink-0 text-gold-light">{p.views.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={load} className="ghost-button mt-3 !px-3 !py-1.5 text-xs">
        再取得
      </button>
    </div>
  );
}
