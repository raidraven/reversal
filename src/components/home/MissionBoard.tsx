"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SKILL_ICONS } from "@/lib/missions";
import { titleForRank, type RankRow } from "@/lib/rankTitle";
import { EditableText } from "@/components/admin/EditableText";
import { Icon } from "@/components/Icon";

export type MissionItem = {
  id: string;
  title: string;
  description: string;
  expReward: number;
  skillKey: string;
  done: boolean;
};

type Props = {
  missions: MissionItem[];
  ranks?: RankRow[];
  boardTitle?: string;
};

function ParticleBurst() {
  // 完了時の軽いパーティクル演出(CSSのみ)
  const particles = Array.from({ length: 8 });
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const x = Math.cos(angle) * 36;
        const y = Math.sin(angle) * 36;
        return (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-gold"
            style={{
              animation: `particle-fly 0.6s ease-out forwards`,
              // @ts-expect-error CSS custom properties
              "--tx": `${x}px`,
              "--ty": `${y}px`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes particle-fly {
          from {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          to {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
}

export function MissionBoard({ missions, ranks, boardTitle = "今宵の使命" }: Props) {
  const router = useRouter();
  const [localDone, setLocalDone] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [bursting, setBursting] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDone = (m: MissionItem) => m.done || !!localDone[m.id];
  const doneCount = missions.filter(isDone).length;

  async function complete(mission: MissionItem) {
    if (isDone(mission) || pending) return;
    setError(null);
    setPending(mission.id);
    try {
      const res = await fetch("/api/missions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId: mission.id }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 409) {
          // 既に完了済み(別タブ等)→ 表示を同期
          setLocalDone((prev) => ({ ...prev, [mission.id]: true }));
          router.refresh();
        } else {
          setError(data?.error ?? "処理に失敗しました");
        }
        return;
      }

      setLocalDone((prev) => ({ ...prev, [mission.id]: true }));
      setBursting(mission.id);
      setTimeout(() => setBursting(null), 650);

      if (data?.leveledUp) {
        setLevelUp(data.newLevel);
        setTimeout(() => setLevelUp(null), 3500);
      }

      // EXPバー・レーダーチャート等のサーバーデータを更新
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="game-card animate-fade-up relative" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between">
        <h2 className="mansion-title flex items-center gap-1.5 text-base">
          <Icon name="key-ornate" size={18} />
          <EditableText siteTextKey="mission.board.title" value={boardTitle} />
        </h2>
        <span className="text-xs text-stone-400">
          {doneCount} / {missions.length} 完了
        </span>
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}

      <ul className="mt-3 space-y-2">
        {missions.map((m) => {
          const done = isDone(m);
          const icon = SKILL_ICONS[m.skillKey] ?? "candle";
          return (
            <li key={m.id} className="relative">
              <button
                onClick={() => complete(m)}
                disabled={done || pending === m.id}
                className={`w-full rounded-md border p-3 text-left transition-all duration-200 ${
                  done
                    ? "border-gold/50 bg-gold/10"
                    : "border-surface-border bg-surface-raised hover:border-gold/40"
                } ${pending === m.id ? "opacity-60" : ""}`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg ${
                      done ? "bg-gold/20" : "bg-surface-card"
                    }`}
                  >
                    {done ? <Icon name="check" size={18} /> : <Icon name={icon} size={18} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-semibold ${
                        done ? "text-stone-400 line-through" : "text-stone-100"
                      }`}
                    >
                      {m.title}
                    </span>
                    <span className="block truncate text-xs text-stone-500">{m.description}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                      done ? "bg-gold/20 text-gold-light" : "bg-surface-card text-gold"
                    }`}
                  >
                    +{m.expReward}
                  </span>
                </span>
              </button>
              {bursting === m.id && <ParticleBurst />}
            </li>
          );
        })}
      </ul>

      {doneCount === missions.length && missions.length > 0 && (
        <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs font-bold text-gold-light">
          <Icon name="candle" size={14} /> 今宵の使命、すべて達せられました。また明日の夜会にて
        </p>
      )}

      {/* レベルアップ演出 */}
      {levelUp !== null && (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center">
          <div className="animate-fade-up rounded-lg border border-gold/60 bg-surface-card px-6 py-4 text-center shadow-gold">
            <div className="flex justify-center">
              <Icon name="candle" size={24} />
            </div>
            <p className="mansion-title text-lg font-black">位階上昇</p>
            <p className="text-sm text-stone-200">
              Lv.{levelUp}「{titleForRank(levelUp, ranks)}」になりました
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
