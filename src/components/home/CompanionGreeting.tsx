"use client";

import { useEffect, useState } from "react";
import { COMPANION_CONFIG } from "@/config/companion";
import { DEFAULT_EMOTION, type CompanionEmotion } from "@/lib/companionEmotion";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";

// 今宵のひとこと(その日初回のみClaude APIで生成、以降は当日分を再表示)
type Props = {
  name: string;
};

export function CompanionGreeting({ name }: Props) {
  const fallback = `お帰りなさいませ、${name}様。今宵も雇われの身の荒波を生き抜いてこられたのですね。さあ、ご自身の力を築くお時間でございます。まずは今宵の使命からいかがでしょうか。`;
  const [message, setMessage] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<CompanionEmotion>(DEFAULT_EMOTION);
  const [companionName, setCompanionName] = useState(COMPANION_CONFIG.name);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/companion/greeting")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.greeting) return;
        setMessage(data.greeting);
        if (data.emotion) setEmotion(data.emotion);
      })
      .catch(() => {
        /* フォールバック表示のまま */
      });
    fetch("/api/site-texts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.texts) return;
        if (data.texts["companion.name"]) setCompanionName(data.texts["companion.name"]);
      })
      .catch(() => {
        /* デフォルト値のまま */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="game-card animate-fade-up flex items-start gap-3 border-gold/30">
      <CompanionAvatar emotion={emotion} fallbackEmoji={COMPANION_CONFIG.emoji} sizeClass="h-12 w-12" />
      <div>
        <p className="text-xs font-bold text-gold-light">{companionName}(執事)</p>
        <p className={`mt-1 text-sm leading-relaxed text-stone-200 ${message === null ? "opacity-80" : ""}`}>
          {message ?? fallback}
        </p>
      </div>
    </section>
  );
}
