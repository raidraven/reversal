"use client";

import { useEffect, useState } from "react";

type Draft = {
  id: string;
  platform: string;
  sourceType: string;
  bodyText: string;
  status: string;
  externalId: string | null;
  errorMessage: string | null;
  createdAt: string;
  postedAt: string | null;
};

const SOURCE_LABELS: Record<string, string> = {
  rotation: "自動生成(ローテーション)",
  manual: "手動生成",
};

export function SocialDraftsManager() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [editText, setEditText] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/social-drafts");
    if (res.ok) {
      const data = await res.json();
      setDrafts(data.drafts);
      setEditText(Object.fromEntries(data.drafts.map((d: Draft) => [d.id, d.bodyText])));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/social-drafts", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "生成に失敗しました");
        return;
      }
      setDrafts((prev) => [data.draft, ...prev]);
      setEditText((prev) => ({ ...prev, [data.draft.id]: data.draft.bodyText }));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveEdit(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/social-drafts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bodyText: editText[id] }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "保存に失敗しました");
        return;
      }
      setDrafts((prev) => prev.map((d) => (d.id === id ? data.draft : d)));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePublish(id: string) {
    if (!window.confirm("この内容でXへ実際に投稿します。よろしいですか?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/social-drafts/${id}/publish`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "投稿に失敗しました");
        await load();
        return;
      }
      setDrafts((prev) => prev.map((d) => (d.id === id ? data.draft : d)));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDismiss(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/social-drafts/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "却下に失敗しました");
        return;
      }
      setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, status: "dismissed" } : d)));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-md bg-surface-raised" />;

  return (
    <>
      <p className="text-xs text-stone-500">
        毎朝、曜日ローテーションに沿った下書きが自動生成されます。実際にXへ投稿されるのは「投稿する」ボタンを押した時だけです。
      </p>
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="ghost-button mt-3 !px-3 !py-1.5 text-xs"
      >
        {generating ? "生成中…" : "今すぐ下書きを生成"}
      </button>

      {error && (
        <p className="mt-3 rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}

      {drafts.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">まだ下書きはありません。</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {drafts.map((d) => (
            <li key={d.id} className="rounded-md border border-surface-border bg-surface-raised p-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {d.platform.toUpperCase()} · {SOURCE_LABELS[d.sourceType] ?? d.sourceType} ·{" "}
                  {new Date(d.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                </span>
                <span
                  className={
                    d.status === "posted"
                      ? "rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] text-gold-light"
                      : d.status === "dismissed"
                        ? "rounded-full bg-surface px-1.5 py-0.5 text-[10px] text-stone-500"
                        : "rounded-full bg-wine/20 px-1.5 py-0.5 text-[10px] text-gold-light"
                  }
                >
                  {d.status === "posted" ? "投稿済み" : d.status === "dismissed" ? "却下済み" : "未投稿"}
                </span>
              </div>

              {d.status === "draft" ? (
                <textarea
                  value={editText[d.id] ?? ""}
                  onChange={(e) => setEditText((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  rows={4}
                  className="form-input mt-2 !py-1.5 text-xs"
                />
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-xs text-stone-300">{d.bodyText}</p>
              )}

              {d.errorMessage && (
                <p className="mt-1 text-[10px] text-wine-light">エラー: {d.errorMessage}</p>
              )}
              {d.externalId && (
                <p className="mt-1 text-[10px] text-stone-500">投稿ID: {d.externalId}</p>
              )}

              {d.status === "draft" && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(d.id)}
                    disabled={busyId === d.id}
                    className="ghost-button !px-3 !py-1.5 text-xs"
                  >
                    編集を保存
                  </button>
                  <button
                    onClick={() => handlePublish(d.id)}
                    disabled={busyId === d.id}
                    className="neon-button !px-3 !py-1.5 text-xs"
                  >
                    投稿する
                  </button>
                  <button
                    onClick={() => handleDismiss(d.id)}
                    disabled={busyId === d.id}
                    className="rounded-md border border-wine-light/50 px-3 py-1.5 text-xs text-gold-light transition-colors hover:bg-wine/20"
                  >
                    却下
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
