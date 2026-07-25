"use client";

import { useState } from "react";
import Link from "next/link";
import { DIAGNOSTIC_QUESTIONS, type DiagnosticAnswers } from "@/lib/onboarding";
import { rankSideHustleTracks } from "@/lib/sideHustleDiagnosis";
import { Icon } from "@/components/Icon";

type Answers = Partial<DiagnosticAnswers>;

const QUESTION_KEYS = DIAGNOSTIC_QUESTIONS.map((q) => q.key);

export function DiagnosisQuiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = QUESTION_KEYS.every((k) => answers[k as keyof Answers] !== undefined);

  function select(key: string, value: number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
  }

  if (submitted && allAnswered) {
    const ranked = rankSideHustleTracks(answers as DiagnosticAnswers);
    const top3 = ranked.slice(0, 3);
    const best = top3[0];

    return (
      <div className="space-y-4">
        <section className="game-card animate-fade-up space-y-1 text-center">
          <p className="flex justify-center">
            <Icon name="candle" size={28} />
          </p>
          <p className="mansion-title text-base">あなたに合う副業、上位3つ</p>
        </section>

        {top3.map((track, i) => (
          <section
            key={track.id}
            className={`game-card animate-fade-up ${i === 0 ? "border-gold/60" : ""}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-base font-bold text-stone-100">
                {i === 0 && <span className="mr-1 text-gold-light">1位</span>}
                {i === 1 && <span className="mr-1 text-stone-400">2位</span>}
                {i === 2 && <span className="mr-1 text-stone-500">3位</span>}
                {track.name}
              </p>
            </div>
            <p className="mt-1 text-sm text-stone-400">{track.description}</p>
          </section>
        ))}

        {best && (
          <section className="game-card animate-fade-up space-y-2 border-gold/60">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-gold-light">
              <Icon name="key-ornate" size={16} />
              今日やる最初の1タスク
            </p>
            <p className="text-sm text-stone-200">{best.firstTask}</p>
          </section>
        )}

        <div className="game-card animate-fade-up space-y-3 text-center">
          <p className="text-sm text-stone-300">
            この診断結果と連動した「今宵の使命」で、続けられる仕組みごと体験できます。
          </p>
          <Link href="/signup" className="neon-button block text-center">
            招待状を受け取る
          </Link>
          <button onClick={retry} className="ghost-button w-full !py-1.5 text-xs">
            もう一度診断する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {DIAGNOSTIC_QUESTIONS.map((q) => (
        <section key={q.key} className="game-card">
          <p className="text-sm font-semibold text-stone-100">{q.question}</p>
          <div className="mt-3 flex flex-col gap-2">
            {q.options.map((opt) => {
              const isSelected = answers[q.key as keyof Answers] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => select(q.key, opt.value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-gold bg-gold/10 text-gold-light"
                      : "border-surface-border bg-surface-raised text-stone-300 hover:border-gold/40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <button
        onClick={() => setSubmitted(true)}
        disabled={!allAnswered}
        className="neon-button w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        診断する
      </button>
    </div>
  );
}
