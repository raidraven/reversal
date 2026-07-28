"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { SKILL_ICONS } from "@/lib/missions";
import { expForLevelUp, expProgress, levelFromExp } from "@/lib/leveling";
import { titleForRank } from "@/lib/rankTitle";
import { previousDay } from "@/lib/date";
import { PlayerStatusCard } from "@/components/home/PlayerStatusCard";
import { StreakCard } from "@/components/home/StreakCard";
import { MemberCard } from "@/components/home/MemberCard";
import { SkillRadarChart } from "@/components/home/SkillRadarChart";
import { CompanionGreeting } from "@/components/home/CompanionGreeting";
import { CompanionTrialChat } from "@/components/experience/CompanionTrialChat";

const GUEST_NAME = "名も無き来賓";
const MAX_DEMO_LEVEL = 5;
const STORAGE_KEY = "reversal_experience_demo_v1";

type DemoMission = {
  id: string;
  title: string;
  description: string;
  expReward: number;
  skillKey: string;
};

type SkillState = {
  writing: number;
  toolUsage: number;
  consistency: number;
  publishing: number;
  monetization: number;
};

type DemoState = {
  totalExp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  completedMissionIds: string[];
  skills: SkillState;
};

const INITIAL_STATE: DemoState = {
  totalExp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  completedMissionIds: [],
  skills: { writing: 10, toolUsage: 10, consistency: 10, publishing: 10, monetization: 10 },
};

function loadState(): DemoState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATE, ...parsed, skills: { ...INITIAL_STATE.skills, ...parsed.skills } };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: DemoState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorageが使えない環境ではメモリ上の状態のみで動作させる
  }
}

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

type Props = {
  missions: DemoMission[];
  todayStr: string;
  trialChatRemaining: number;
};

export function ExperienceDemo({ missions, todayStr, trialChatRemaining }: Props) {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [bursting, setBursting] = useState<string | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    const loaded = loadState();
    // 日付が変わっていたら、今日分の完了リストだけリセットする(EXP・連夜等は保持)
    const completedMissionIds = loaded.lastActiveDate === todayStr ? loaded.completedMissionIds : [];
    setState({ ...loaded, completedMissionIds });
    setHydrated(true);
  }, [todayStr]);

  const rawLevel = levelFromExp(state.totalExp);
  const level = Math.min(rawLevel, MAX_DEMO_LEVEL);
  const atCap = rawLevel >= MAX_DEMO_LEVEL;
  const title = titleForRank(level);
  const progress = atCap
    ? { current: expForLevelUp(MAX_DEMO_LEVEL), required: expForLevelUp(MAX_DEMO_LEVEL) }
    : expProgress(state.totalExp);

  const doneCount = missions.filter((m) => state.completedMissionIds.includes(m.id)).length;
  const atRisk = state.completedMissionIds.length === 0;

  function complete(mission: DemoMission) {
    if (state.completedMissionIds.includes(mission.id)) return;

    setState((prev) => {
      const isNewDay = prev.lastActiveDate !== todayStr;
      const nextStreak = isNewDay
        ? prev.lastActiveDate === previousDay(todayStr)
          ? prev.currentStreak + 1
          : 1
        : prev.currentStreak;
      const nextCompleted = isNewDay ? [mission.id] : [...prev.completedMissionIds, mission.id];
      const nextExp = prev.totalExp + mission.expReward;
      const skillKey = mission.skillKey as keyof SkillState;
      const nextSkills = {
        ...prev.skills,
        [skillKey]: Math.min((prev.skills[skillKey] ?? 10) + 8, 100),
      };

      const prevLevel = Math.min(levelFromExp(prev.totalExp), MAX_DEMO_LEVEL);
      const newLevel = Math.min(levelFromExp(nextExp), MAX_DEMO_LEVEL);
      if (newLevel > prevLevel) {
        setLevelUp(newLevel);
        setTimeout(() => setLevelUp(null), 3000);
      }

      const next: DemoState = {
        totalExp: nextExp,
        currentStreak: nextStreak,
        longestStreak: Math.max(prev.longestStreak, nextStreak),
        lastActiveDate: todayStr,
        completedMissionIds: nextCompleted,
        skills: nextSkills,
      };
      saveState(next);
      return next;
    });

    setBursting(mission.id);
    setTimeout(() => setBursting(null), 650);
  }

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-md lg:max-w-5xl">
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {/* 左カラム */}
        <div className="space-y-4">
          <CompanionGreeting name={GUEST_NAME} />
          <PlayerStatusCard
            name={GUEST_NAME}
            avatarIcon="mask"
            level={level}
            title={title}
            expCurrent={progress.current}
            expRequired={progress.required}
          />
          <StreakCard currentStreak={state.currentStreak} longestStreak={state.longestStreak} atRisk={atRisk} />
          <MemberCard name={GUEST_NAME} avatarIcon="mask" level={level} title={title} memberSinceLabel="体験中" />
        </div>

        {/* 右カラム */}
        <div className="space-y-4">
          <section className="game-card animate-fade-up relative">
            <div className="flex items-center justify-between">
              <h2 className="mansion-title flex items-center gap-1.5 text-base">
                <Icon name="key-ornate" size={18} />
                今宵の使命(体験版)
              </h2>
              <span className="text-xs text-stone-400">
                {doneCount} / {missions.length} 完了
              </span>
            </div>

            <ul className="mt-3 space-y-2">
              {missions.map((m) => {
                const isDone = state.completedMissionIds.includes(m.id);
                const icon: IconName = SKILL_ICONS[m.skillKey] ?? "candle";
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
                          {isDone ? <Icon name="check" size={18} /> : <Icon name={icon} size={18} />}
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

            {atCap && (
              <p className="mt-3 text-center text-xs text-gold-light">
                体験版の位階上限(Lv.{MAX_DEMO_LEVEL})に到達しました。技量・連夜の記録はこのまま伸ばせます
              </p>
            )}

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

          <SkillRadarChart skills={state.skills} />
        </div>
      </div>

      <CompanionTrialChat initialRemaining={trialChatRemaining} />
    </div>
  );
}
