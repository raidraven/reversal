"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "送信に失敗しました");
        return;
      }
      setSent(true);
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
          <p className="flex justify-center">
            <Icon name="candle" size={32} />
          </p>
          <h1 className="mansion-title mt-2 text-2xl">パスワードをお忘れですか</h1>
          <p className="mt-1 text-sm text-stone-400">
            登録済みのメールアドレスに、再設定用のリンクをお送りします
          </p>
        </div>

        {error && (
          <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-sm text-gold-light">
            {error}
          </p>
        )}

        {sent ? (
          <p className="rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-sm text-gold-light">
            そのメールアドレスが登録済みであれば、再設定用のリンクをお送りしました。メールをご確認ください。
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button type="submit" disabled={loading} className="neon-button w-full">
              {loading ? "送信中…" : "再設定リンクを送る"}
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
