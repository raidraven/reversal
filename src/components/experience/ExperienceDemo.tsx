"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { expForLevelUp, levelFromExp } from "@/lib/leveling";
import { titleForRank } from "@/lib/rankTitle";

const GUEST_NAME = "名も無き来賓";

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

/** レベル1からlevel未満までに必要だった累計EXP */
function expSpentBefore(level: number): number {
  let acc = 0;
  for (let l = 1; l < level; l++) acc += expForLevelUp(l);
  return acc;
}

export function ExperienceDemo() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [bursting, setBursting] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  const exp = DEMO_MISSIONS.filter((m) => done[m.id]).reduce((sum, m) => sum + m.expReward, 0);
  const allDone = DEMO_MISSIONS.every((m) => done[m.id]);
  const doneCount = DEMO_MISSIONS.filter((m) => done[m.id]).length;

  const level = levelFromExp(exp);
  const title = titleForRank(level);
  const required = expForLevelUp(level);
  const current = exp - expSpentBefore(level);
  const percent = Math.min(Math.round((current / required) * 100), 100);

  function complete(mission: DemoMission) {
    if (done[mission.id]) return;
    const prevLevel = levelFromExp(exp);
    const nextExp = exp + mission.expReward;
    setDone((prev) => ({ ...prev, [mission.id]: true }));
    setBursting(mission.id);
    setTimeout(() => setBursting(null), 650);

    const nextLevel = levelFromExp(nextExp);
    if (nextLevel > prevLevel) {
      setLevelUp(nextLevel);
      setTimeout(() => setLevelUp(null), 3000);
    }
  }

  return (
    <div className="space-y-4">
      {/* 自室ページの見た目を再現したプレビュー */}
      <section className="game-card animate-fade-up">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-surface-raised shadow-gold">
            <Icon name="mask" size={36} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-serif text-xl font-bold text-stone-100">{GUEST_NAME} 様</p>
            <p className="mt-0.5 inline-block rounded-full border border-wine-light/50 bg-wine/20 px-2 py-0.5 text-xs text-gold-light">
              {title}
            </p>
          </div>
          <span className="ml-auto text-right">
            <span className="block text-xs text-stone-500">位階</span>
            <span className="block text-3xl font-black text-gold-light drop-shadow-[0_0_8px_rgba(201,162,77,0.4)]">
              {level}
            </span>
          </span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-stone-400">
            <span>経験値</span>
            <span>
              <span className="font-bold text-stone-200">{current}</span> / {required}
            </span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full bg-gradient-to-r from-wine-light to-gold transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </section>

      {/* 使命ボード */}
      <section className="game-card animate-fade-up relative" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between">
          <h2 className="mansion-title flex items-center gap-1.5 text-base">
            <Icon name="key-ornate" size={18} />
            今宵の使命(体験版)
          </h2>
          <span className="text-xs text-stone-400">
            {doneCount} / {DEMO_MISSIONS.length} 完了
          </span>
        </div>

        <ul className="mt-3 space-y-2">
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

        {/* レベルアップ演出(実際の自室ページと同じ見た目) */}
        {levelUp !== null && (
          <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center">
            <div className="animate-fade-up rounded-lg border border-gold/60 bg-surface-card px-6 py-4 text-center shadow-gold">
              <div className="flex justify-center">
                <Icon name="candle" size={24} />
              </div>
              <p className="mansion-title text-lg font-black">位階上昇</p>
              <p className="text-sm text-stone-200">
                Lv.{levelUp}「{titleForRank(levelUp)}」になりました
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 達成後のCTA */}
      {allDone && (
        <div className="game-card animate-fade-up space-y-3 border-gold/60 text-center">
          <p className="flex justify-center">
            <Icon name="candle" size={28} />
          </p>
          <p className="mansion-title text-base">これが、あなたの自室になります</p>
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
