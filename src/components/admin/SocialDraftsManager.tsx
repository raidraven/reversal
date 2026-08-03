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

const JST_DATE_FORMATTER = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" });

function jstDateStr(date: Date): string {
  return JST_DATE_FORMATTER.format(date);
}

/** 下書きの生成日(JST)が今日と違う場合、内容が古い(曜日ズレ)可能性があるので警告対象にする */
function isStaleDraft(createdAt: string): boolean {
  return jstDateStr(new Date(createdAt)) !== jstDateStr(new Date());
}

export function SocialDraftsManager() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [editText, setEditText] = useState<Record<string, string>>({});
  const [scheduleTime, setScheduleTime] = useState("08:00");
  const [scheduleInput, setScheduleInput] = useState("08:00");
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

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

  async function loadSchedule() {
    const res = await fetch("/api/admin/social-draft-schedule");
    if (res.ok) {
      const data = await res.json();
      setScheduleTime(data.scheduleTime);
      setScheduleInput(data.scheduleTime);
    }
  }

  useEffect(() => {
    load();
    loadSchedule();
  }, []);

  async function handleSaveSchedule() {
    setScheduleSaving(true);
    setError(null);
    setScheduleSaved(false);
    try {
      const res = await fetch("/api/admin/social-draft-schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleTime: scheduleInput }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "保存に失敗しました");
        return;
      }
      setScheduleTime(data.scheduleTime);
      setScheduleSaved(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setScheduleSaving(false);
    }
  }

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

  async function handlePublish(id: string, createdAt: string) {
    const confirmMessage = isStaleDraft(createdAt)
      ? "⚠️ この下書きは生成日が今日と異なります(内容が古い可能性があります)。それでもXへ投稿しますか?"
      : "この内容でXへ実際に投稿します。よろしいですか?";
    if (!window.confirm(confirmMessage)) return;
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
        毎日設定した時刻(JST)に、曜日ローテーションに沿った下書きが自動生成されます。実際にXへ投稿されるのは「投稿する」ボタンを押した時だけです。
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-surface-border bg-surface-raised p-3">
        <label htmlFor="social-draft-schedule-time" className="text-xs text-stone-400">
          自動生成時刻(JST)
        </label>
        <input
          id="social-draft-schedule-time"
          type="time"
          value={scheduleInput}
          onChange={(e) => {
            setScheduleInput(e.target.value);
            setScheduleSaved(false);
          }}
          className="form-input !w-auto !py-1 text-xs"
        />
        <button
          onClick={handleSaveSchedule}
          disabled={scheduleSaving || scheduleInput === scheduleTime}
          className="ghost-button !px-3 !py-1.5 text-xs"
        >
          {scheduleSaving ? "保存中…" : "保存"}
        </button>
        {scheduleSaved && <span className="text-xs text-gold-light">保存しました</span>}
        <span className="basis-full text-[10px] text-stone-500">
          現在の設定: 毎日{scheduleTime}以降、最初のチェックで生成(最大15分程度の誤差あり)
        </span>
      </div>

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
              {d.status === "draft" && isStaleDraft(d.createdAt) && (
                <p className="mt-1 text-[10px] text-wine-light">
                  ⚠️ 生成日が今日と異なります。内容が古い可能性があるので投稿前に見直してください。
                </p>
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
                    onClick={() => handlePublish(d.id, d.createdAt)}
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
