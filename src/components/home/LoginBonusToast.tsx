"use client";

import { useEffect, useState } from "react";
import { titleForRank, type RankRow } from "@/lib/rankTitle";
import type { DailyActivityResult } from "@/lib/game";
import { Icon } from "@/components/Icon";

type Props = {
  result: DailyActivityResult;
  ranks?: RankRow[];
};

/** 日次初回の入館時に表示する、EXP付与・レベルアップの演出トースト */
export function LoginBonusToast({ result, ranks }: Props) {
  const [visible, setVisible] = useState(result.firstToday);

  useEffect(() => {
    if (!result.firstToday) return;
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [result.firstToday]);

  if (!result.firstToday || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
      <div className="animate-fade-up rounded-lg border border-gold/60 bg-surface-card px-6 py-4 text-center shadow-gold">
        <p className="flex justify-center">
          <Icon name="candle" size={20} />
        </p>
        <p className="mansion-title text-sm">本日の入館を歓迎いたします</p>
        <p className="mt-1 text-xs text-stone-300">+{result.expGained} 経験値を授かりました</p>
        {result.leveledUp && (
          <p className="mt-2 text-sm font-bold text-gold-light">
            位階が上がり、Lv.{result.newLevel}「{titleForRank(result.newLevel, ranks)}」になりました
          </p>
        )}
      </div>
    </div>
  );
}
