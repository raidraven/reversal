"use client";

import { useEffect, useState } from "react";

type Rank = { id: string; minLevel: number; title: string };

export function RanksManager() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMinLevel, setNewMinLevel] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/ranks");
    if (res.ok) {
      const data = await res.json();
      setRanks(data.ranks);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateLocal(id: string, patch: Partial<Rank>) {
    setRanks((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function saveRank(rank: Rank) {
    setBusyId(rank.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ranks/${rank.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minLevel: rank.minLevel, title: rank.title }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "保存に失敗しました");
        return;
      }
      await load();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteRank(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ranks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "削除に失敗しました");
        return;
      }
      setRanks((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  async function addRank(e: React.FormEvent) {
    e.preventDefault();
    const minLevel = Number(newMinLevel);
    if (!Number.isInteger(minLevel) || minLevel < 1 || !newTitle.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/admin/ranks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minLevel, title: newTitle.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "追加に失敗しました");
        return;
      }
      setNewMinLevel("");
      setNewTitle("");
      await load();
    } catch {
      setError("通信エラーが発生しました");
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-md bg-surface-raised" />;

  const sorted = [...ranks].sort((a, b) => a.minLevel - b.minLevel);

  return (
    <>
      {error && (
        <p className="mt-3 rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {sorted.map((r) => (
          <li key={r.id} className="flex items-center gap-2 rounded-md border border-surface-border bg-surface-raised p-2">
            <input
              type="number"
              min={1}
              value={r.minLevel}
              onChange={(e) => updateLocal(r.id, { minLevel: Number(e.target.value) })}
              className="form-input w-20 !py-1.5 text-sm"
            />
            <input
              type="text"
              value={r.title}
              onChange={(e) => updateLocal(r.id, { title: e.target.value })}
              className="form-input flex-1 !py-1.5 text-sm"
            />
            <button
              onClick={() => saveRank(r)}
              disabled={busyId === r.id}
              className="ghost-button !px-3 !py-1.5 text-xs"
            >
              保存
            </button>
            <button
              onClick={() => deleteRank(r.id)}
              disabled={busyId === r.id}
              className="rounded-md border border-wine-light/50 px-3 py-1.5 text-xs text-gold-light transition-colors hover:bg-wine/20"
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addRank} className="mt-4 flex items-center gap-2 border-t border-surface-border pt-4">
        <input
          type="number"
          min={1}
          placeholder="Lv."
          value={newMinLevel}
          onChange={(e) => setNewMinLevel(e.target.value)}
          className="form-input w-20 !py-1.5 text-sm"
        />
        <input
          type="text"
          placeholder="新しい称号"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="form-input flex-1 !py-1.5 text-sm"
        />
        <button type="submit" className="neon-button !px-4 !py-1.5 text-xs">
          追加
        </button>
      </form>
    </>
  );
}
