"use client";

import { useEffect, useState } from "react";
import { SKILL_LABELS } from "@/lib/missions";

type Mission = {
  id: string;
  title: string;
  description: string;
  expReward: number;
  skillKey: string;
};

const SKILL_OPTIONS = Object.keys(SKILL_LABELS);

export function MissionsManager() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newExpReward, setNewExpReward] = useState("30");
  const [newSkillKey, setNewSkillKey] = useState(SKILL_OPTIONS[0]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/missions");
    if (res.ok) {
      const data = await res.json();
      setMissions(data.missions);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateLocal(id: string, patch: Partial<Mission>) {
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function saveMission(mission: Mission) {
    setBusyId(mission.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/missions/${mission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: mission.title,
          description: mission.description,
          expReward: mission.expReward,
          skillKey: mission.skillKey,
        }),
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

  async function deleteMission(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/missions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "削除に失敗しました");
        return;
      }
      setMissions((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  async function addMission(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    const expReward = Number(newExpReward);
    if (!Number.isInteger(expReward) || expReward < 1) return;

    setError(null);
    try {
      const res = await fetch("/api/admin/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          expReward,
          skillKey: newSkillKey,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "追加に失敗しました");
        return;
      }
      setNewTitle("");
      setNewDescription("");
      setNewExpReward("30");
      await load();
    } catch {
      setError("通信エラーが発生しました");
    }
  }

  if (loading) return <section className="game-card animate-pulse h-40" />;

  return (
    <section className="game-card">
      <h2 className="mansion-title text-lg">今宵の使命(デイリーミッション)の設定</h2>
      <p className="mt-1 text-xs text-stone-500">
        ここに登録された項目の中から、日替わりで3つがランダムに選ばれます(全 {missions.length} 件登録中)。
      </p>

      {error && (
        <p className="mt-3 rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {missions.map((m) => (
          <li key={m.id} className="space-y-2 rounded-md border border-surface-border bg-surface-raised p-3">
            <input
              type="text"
              value={m.title}
              onChange={(e) => updateLocal(m.id, { title: e.target.value })}
              className="form-input !py-1.5 text-sm font-semibold"
            />
            <textarea
              value={m.description}
              onChange={(e) => updateLocal(m.id, { description: e.target.value })}
              rows={2}
              className="form-input resize-none !py-1.5 text-xs"
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-stone-500">
                EXP:
                <input
                  type="number"
                  min={1}
                  value={m.expReward}
                  onChange={(e) => updateLocal(m.id, { expReward: Number(e.target.value) })}
                  className="form-input ml-1 inline-block w-20 !py-1 text-xs"
                />
              </label>
              <label className="text-xs text-stone-500">
                技量:
                <select
                  value={m.skillKey}
                  onChange={(e) => updateLocal(m.id, { skillKey: e.target.value })}
                  className="form-input ml-1 inline-block w-auto !py-1 text-xs"
                >
                  {SKILL_OPTIONS.map((key) => (
                    <option key={key} value={key}>
                      {SKILL_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => saveMission(m)}
                disabled={busyId === m.id}
                className="ghost-button ml-auto !px-3 !py-1.5 text-xs"
              >
                保存
              </button>
              <button
                onClick={() => deleteMission(m.id)}
                disabled={busyId === m.id}
                className="rounded-md border border-wine-light/50 px-3 py-1.5 text-xs text-gold-light transition-colors hover:bg-wine/20"
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={addMission} className="mt-4 space-y-2 border-t border-surface-border pt-4">
        <p className="text-xs font-semibold text-stone-300">新しい使命を追加</p>
        <input
          type="text"
          placeholder="タイトル"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="form-input !py-1.5 text-sm"
        />
        <textarea
          placeholder="説明"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          rows={2}
          className="form-input resize-none !py-1.5 text-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-stone-500">
            EXP:
            <input
              type="number"
              min={1}
              value={newExpReward}
              onChange={(e) => setNewExpReward(e.target.value)}
              className="form-input ml-1 inline-block w-20 !py-1 text-xs"
            />
          </label>
          <label className="text-xs text-stone-500">
            技量:
            <select
              value={newSkillKey}
              onChange={(e) => setNewSkillKey(e.target.value)}
              className="form-input ml-1 inline-block w-auto !py-1 text-xs"
            >
              {SKILL_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {SKILL_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="neon-button ml-auto !px-4 !py-1.5 text-xs">
            追加
          </button>
        </div>
      </form>
    </section>
  );
}
