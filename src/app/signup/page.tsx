"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AVATARS, DIAGNOSTIC_QUESTIONS } from "@/lib/onboarding";

type Step = "account" | "diagnostic";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");

  // アカウント情報
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 初期診断
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goToDiagnostic(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    setStep("diagnostic");
  }

  const allAnswered = DIAGNOSTIC_QUESTIONS.every((q) => answers[q.key] != null);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          avatarId,
          answers: {
            writing: answers.writing,
            toolUsage: answers.toolUsage,
            publishing: answers.publishing,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "登録に失敗しました");
        setLoading(false);
        return;
      }

      // 登録後、そのままログインしてホームへ
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        router.push("/login");
        return;
      }
      await fetch("/api/likes/merge-anon", { method: "POST" }).catch(() => {});
      router.push("/home");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="game-card w-full max-w-sm space-y-5 animate-fade-up">
        <div className="text-center">
          <p className="text-3xl">🎭</p>
          <h1 className="mansion-title mt-2 text-2xl">
            {step === "account" ? "入館の儀" : "仮面を選ぶ"}
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            {step === "account"
              ? "リバーサルへようこそ"
              : "あなたの技量を占いましょう"}
          </p>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center gap-2">
          <span
            className={`h-1.5 w-10 rounded-full ${step === "account" ? "bg-gold" : "bg-surface-border"}`}
          />
          <span
            className={`h-1.5 w-10 rounded-full ${step === "diagnostic" ? "bg-gold" : "bg-surface-border"}`}
          />
        </div>

        {error && (
          <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-sm text-gold-light">
            {error}
          </p>
        )}

        {step === "account" ? (
          <form onSubmit={goToDiagnostic} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm text-stone-400">
                お名前(ニックネーム可)
              </label>
              <input
                id="name"
                type="text"
                required
                maxLength={30}
                className="form-input"
                placeholder="例: たろう"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-stone-400">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-stone-400">
                パスワード(8文字以上)
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="neon-button w-full">
              次へ:仮面を選ぶ
            </button>
            <p className="text-center text-sm text-stone-400">
              すでに招待状をお持ちの方は{" "}
              <Link href="/login" className="font-semibold text-gold-light hover:underline">
                こちらから
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-5">
            {DIAGNOSTIC_QUESTIONS.map((q, i) => (
              <div key={q.key} className="space-y-2">
                <p className="text-sm font-semibold text-stone-200">
                  Q{i + 1}. {q.question}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: opt.value }))}
                      className={`rounded-md border px-2 py-2 text-xs transition-colors ${
                        answers[q.key] === opt.value
                          ? "border-gold bg-gold/15 text-gold-light"
                          : "border-surface-border bg-surface-raised text-stone-300 hover:border-gold/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <p className="text-sm font-semibold text-stone-200">仮面を選ぼう</p>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAvatarId(a.id)}
                    title={a.label}
                    className={`rounded-md border py-3 text-2xl transition-colors ${
                      avatarId === a.id
                        ? "border-gold bg-gold/15 shadow-gold"
                        : "border-surface-border bg-surface-raised hover:border-gold/40"
                    }`}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("account")}
                className="ghost-button"
              >
                戻る
              </button>
              <button
                type="button"
                disabled={!allAnswered || loading}
                onClick={handleSubmit}
                className="neon-button flex-1"
              >
                {loading ? "扉を開いております…" : "扉を開く"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
