"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("リンクが無効です。もう一度パスワード再設定をお申し込みください");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "再設定に失敗しました");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="game-card w-full max-w-sm space-y-4 animate-fade-up">
        <div className="text-center">
          <p className="text-3xl">🔑</p>
          <h1 className="mansion-title mt-2 text-2xl">新しいパスワードの設定</h1>
        </div>

        {error && (
          <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-sm text-gold-light">
            {error}
          </p>
        )}

        {done ? (
          <p className="rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-sm text-gold-light">
            パスワードを再設定しました。ログイン画面へ移動します…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-stone-400">
                新しいパスワード(8文字以上)
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
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm text-stone-400">
                新しいパスワード(確認)
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="neon-button w-full">
              {loading ? "設定中…" : "パスワードを再設定する"}
            </button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link href="/login" className="text-stone-400 hover:text-gold-light hover:underline">
            ログインへ戻る
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
