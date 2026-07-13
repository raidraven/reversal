"use client";

import { useEffect, useState } from "react";

type IncidentDay = { id: string; date: string; reason: string | null };

export function IncidentDaysManager() {
  const [incidentDays, setIncidentDays] = useState<IncidentDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/incident-days");
    if (res.ok) {
      const data = await res.json();
      setIncidentDays(data.incidentDays);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addIncidentDay(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setError(null);
    try {
      const res = await fetch("/api/admin/incident-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, reason: newReason.trim() || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "追加に失敗しました");
        return;
      }
      setNewDate("");
      setNewReason("");
      await load();
    } catch {
      setError("通信エラーが発生しました");
    }
  }

  async function deleteIncidentDay(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/incident-days/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "削除に失敗しました");
        return;
      }
      setIncidentDays((prev) => prev.filter((d) => d.id !== id));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <section className="game-card animate-pulse h-40" />;

  return (
    <section className="game-card">
      <h2 className="mansion-title text-lg">障害日(ストリーク救済)の登録</h2>
      <p className="mt-1 text-xs text-stone-500">
        サイト障害・大規模改修などで来賓が来館できなかった日を登録すると、その日は「連夜の参加」判定で欠席扱いにしません。来賓個人のログイン忘れは対象外です。
      </p>

      {error && (
        <p className="mt-3 rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {incidentDays.length === 0 && (
          <li className="text-xs text-stone-600">登録されている障害日はありません。</li>
        )}
        {incidentDays.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-2 rounded-md border border-surface-border bg-surface-raised p-2"
          >
            <span className="font-mono text-sm text-stone-200">{d.date}</span>
            <span className="flex-1 truncate text-xs text-stone-500">{d.reason}</span>
            <button
              onClick={() => deleteIncidentDay(d.id)}
              disabled={busyId === d.id}
              className="rounded-md border border-wine-light/50 px-3 py-1.5 text-xs text-gold-light transition-colors hover:bg-wine/20"
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addIncidentDay} className="mt-4 flex items-center gap-2 border-t border-surface-border pt-4">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="form-input w-40 !py-1.5 text-sm"
        />
        <input
          type="text"
          placeholder="理由(任意・例: サーバー障害)"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          className="form-input flex-1 !py-1.5 text-sm"
        />
        <button type="submit" className="neon-button !px-4 !py-1.5 text-xs">
          登録
        </button>
      </form>
    </section>
  );
}
