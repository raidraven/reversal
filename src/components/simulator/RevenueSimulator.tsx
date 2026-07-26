"use client";

import { useState } from "react";
import Link from "next/link";
import { SIMULATOR_TRACKS, type SimulatorTrack } from "@/lib/revenueSimulator";
import { Icon } from "@/components/Icon";

type RealDataNote = { amount: number; date: string; postId: string } | null;

type Props = {
  initialTrackId: string;
  /** trueの場合、他タイプへの切り替えタブを出さず、このタイプに固定する(個別ページ用) */
  lockTrack?: boolean;
  realData: RealDataNote;
};

function yen(n: number): string {
  return n.toLocaleString("ja-JP");
}

export function RevenueSimulator({ initialTrackId, lockTrack, realData }: Props) {
  const [trackId, setTrackId] = useState(initialTrackId);
  const track = SIMULATOR_TRACKS.find((t) => t.id === trackId) ?? SIMULATOR_TRACKS[0];

  const [unit, setUnit] = useState(track.unitDefault);
  const [quantity, setQuantity] = useState(track.quantityDefault);

  function selectTrack(next: SimulatorTrack) {
    setTrackId(next.id);
    setUnit(next.unitDefault);
    setQuantity(next.quantityDefault);
  }

  const monthly = unit * quantity;
  const yearly = monthly * 12;

  return (
    <div className="space-y-4">
      {!lockTrack && (
        <section className="game-card">
          <p className="text-xs text-stone-400">副業タイプを選ぶ</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIMULATOR_TRACKS.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTrack(t)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  t.id === trackId
                    ? "border-gold bg-gold/10 text-gold-light"
                    : "border-surface-border bg-surface-raised text-stone-300 hover:border-gold/40"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="game-card space-y-4">
        <p className="font-serif text-base font-bold text-stone-100">{track.name}</p>

        <div>
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>{track.unitLabel}</span>
            <span className="font-bold text-gold-light">
              {yen(unit)} {track.unitSuffix}
            </span>
          </div>
          <input
            type="range"
            min={track.unitMin}
            max={track.unitMax}
            step={track.unitStep}
            value={unit}
            onChange={(e) => setUnit(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>{track.quantityLabel}</span>
            <span className="font-bold text-gold-light">
              {yen(quantity)} {track.quantitySuffix}
            </span>
          </div>
          <input
            type="range"
            min={track.quantityMin}
            max={track.quantityMax}
            step={track.quantityStep}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </div>
      </section>

      <section className="game-card space-y-2 border-gold/60 text-center">
        <p className="text-xs text-stone-400">
          {track.unitLabel} {yen(unit)}{track.unitSuffix} × {track.quantityLabel} {yen(quantity)}{track.quantitySuffix}
        </p>
        <p className="text-3xl font-black text-gold-light drop-shadow-[0_0_8px_rgba(201,162,77,0.4)]">
          月収 {yen(monthly)} 円
        </p>
        <p className="text-sm text-stone-400">年収換算 {yen(yearly)} 円</p>
      </section>

      {realData && (
        <section className="game-card">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-400">
            <Icon name="quill" size={14} />
            このサイト自身の実況ログ
          </p>
          <p className="mt-1 text-sm text-stone-300">
            直近の報告: <span className="font-bold text-gold-light">{yen(realData.amount)}円</span>
            <span className="text-stone-500">({realData.date}時点)</span>
          </p>
          <p className="mt-1 text-xs text-stone-500">
            シミュレーターの数字は目安です。誇張なしの実例は
            <Link href={`/board/${realData.postId}`} className="text-gold-light hover:underline">
              掲示板の実況ログ
            </Link>
            で確認できます。
          </p>
        </section>
      )}
    </div>
  );
}
