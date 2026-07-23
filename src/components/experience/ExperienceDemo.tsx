"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";

type DemoMission = {
  id: string;
  title: string;
  description: string;
  expReward: number;
  icon: IconName;
};

const DEMO_MISSIONS: DemoMission[] = [
  {
    id: "talk",
    title: "クロエに相談する",
    description: "副業の悩みや疑問を、ひとつ話しかけてみよう",
    expReward: 50,
    icon: "talk",
  },
  {
    id: "log",
    title: "今日の作業をひとつ記録する",
    description: "小さくてOK。何をしたか一言メモしてみよう",
    expReward: 50,
    icon: "quill",
  },
];

const TOTAL_EXP = DEMO_MISSIONS.reduce((sum, m) => sum + m.expReward, 0);

function ParticleBurst() {
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
              animation: `exp-particle-fly 0.6s ease-out forwards`,
              // @ts-expect-error CSS custom properties
              "--tx": `${x}px`,
              "--ty": `${y}px`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes exp-particle-fly {
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

export function ExperienceDemo() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [bursting, setBursting] = useState<string | null>(null);

  const exp = DEMO_MISSIONS.filter((m) => done[m.id]).reduce((sum, m) => sum + m.expReward, 0);
  const allDone = DEMO_MISSIONS.every((m) => done[m.id]);

  function complete(mission: DemoMission) {
    if (done[mission.id]) return;
    setDone((prev) => ({ ...prev, [mission.id]: true }));
    setBursting(mission.id);
    setTimeout(() => setBursting(null), 650);
  }

  return (
    <div className="space-y-4">
      {/* 経験値バー */}
      <div className="game-card">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>体験用の経験値</span>
          <span className="font-bold text-gold-light">
            {exp} / {TOTAL_EXP}
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
            style={{ width: `${(exp / TOTAL_EXP) * 100}%` }}
          />
        </div>
      </div>

      {/* サンプルミッション */}
      <ul className="space-y-2">
        {DEMO_MISSIONS.map((m) => {
          const isDone = !!done[m.id];
          return (
            <li key={m.id} className="relative">
              <button
                onClick={() => complete(m)}
                disabled={isDone}
                className={`w-full rounded-md border p-3 text-left transition-all duration-200 ${
                  isDone ? "border-gold/50 bg-gold/10" : "border-surface-border bg-surface-raised hover:border-gold/40"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg ${
                      isDone ? "bg-gold/20" : "bg-surface-card"
                    }`}
                  >
                    {isDone ? <Icon name="check" size={18} /> : <Icon name={m.icon} size={18} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${isDone ? "text-stone-400 line-through" : "text-stone-100"}`}>
                      {m.title}
                    </span>
                    <span className="block text-xs text-stone-500">{m.description}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                      isDone ? "bg-gold/20 text-gold-light" : "bg-surface-card text-gold"
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

      {/* 達成後のCTA */}
      {allDone && (
        <div className="game-card animate-fade-up space-y-3 border-gold/60 text-center">
          <p className="flex justify-center">
            <Icon name="candle" size={28} />
          </p>
          <p className="mansion-title text-base">位階が上がりかけております</p>
          <p className="text-sm text-stone-300">
            これはあくまで体験版です。本物の位階・経験値・使命は、入館した来賓だけのもの。
            <br />
            続きは、実際にこの館の一員となってお試しくださいませ。
          </p>
          <Link href="/signup" className="neon-button block text-center">
            招待状を受け取る
          </Link>
        </div>
      )}
    </div>
  );
}
