"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === "banned") {
        setError("このアカウントは通報の積み重ねにより利用停止されています");
      } else if (result.error === "rate_limited") {
        setError("ログイン試行回数が多すぎます。15分ほど時間をおいて再度お試しください");
      } else {
        setError("メールアドレスまたはパスワードが正しくありません");
      }
      return;
    }
    await fetch("/api/likes/merge-anon", { method: "POST" }).catch(() => {});
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="game-card w-full max-w-sm space-y-4 animate-fade-up">
      <div className="text-center">
        <p className="text-3xl">🕯️</p>
        <h1 className="mansion-title mt-2 text-2xl">リバーサル</h1>
        <p className="mt-1 text-sm text-stone-400">扉の前で、あなたをお待ちしております</p>
      </div>

      {error && (
        <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-sm text-gold-light">
          {error}
        </p>
      )}

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
          パスワード
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          className="form-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className="neon-button w-full">
        {loading ? "扉を開いております…" : "扉を開く"}
      </button>

      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-stone-400 hover:text-gold-light hover:underline">
          パスワードをお忘れですか?
        </Link>
      </p>

      <p className="text-center text-sm text-stone-400">
        まだ招待状をお持ちでない?{" "}
        <Link href="/signup" className="font-semibold text-gold-light hover:underline">
          入館の儀へ
        </Link>
      </p>
      <p className="text-center text-xs text-stone-600">
        <Link href="/" className="hover:text-stone-400 hover:underline">
          館の入口へ戻る
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
