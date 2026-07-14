"use client";

import { useCountUp } from "./useCountUp";
import { Icon, type IconName } from "@/components/Icon";

type Props = {
  name: string;
  avatarIcon: IconName;
  level: number;
  title: string;
  expCurrent: number;
  expRequired: number;
};

export function PlayerStatusCard({
  name,
  avatarIcon,
  level,
  title,
  expCurrent,
  expRequired,
}: Props) {
  const animatedExp = useCountUp(expCurrent);
  const percent = Math.min(Math.round((expCurrent / expRequired) * 100), 100);

  return (
    <section className="game-card animate-fade-up">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-surface-raised shadow-gold">
          <Icon name={avatarIcon} size={36} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-serif text-xl font-bold text-stone-100">{name} 様</p>
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
            <span className="font-bold text-stone-200">{animatedExp}</span> / {expRequired}
          </span>
        </div>
        <div className="mt-1 h-3 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full animate-bar-grow rounded-full bg-gradient-to-r from-wine-light to-gold"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
