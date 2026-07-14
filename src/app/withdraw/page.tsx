"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function WithdrawPage() {
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "退会処理に失敗しました");
        setLoading(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("通信エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="game-card w-full max-w-sm space-y-4 animate-fade-up">
        <div className="text-center">
          <p className="flex justify-center">
            <Icon name="door" size={32} />
          </p>
          <h1 className="mansion-title mt-2 text-2xl">退会する</h1>
          <p className="mt-1 text-sm text-stone-400">洋館を後にし、この館との縁を断つ手続きです</p>
        </div>

        <div className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-3 text-xs leading-relaxed text-gold-light">
          退会すると、位階・経験値・技量・連夜の参加記録・談話室の投稿・一問一答の質問と回答・クロエとの会話履歴など、
          このアカウントに関するすべてのデータが完全に削除されます。<strong>この操作は取り消せません。</strong>
        </div>

        {error && (
          <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-sm text-gold-light">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="withdraw-password" className="text-xs text-stone-400">
            確認のため、現在のパスワードを入力してください
          </label>
          <input
            id="withdraw-password"
            type="password"
            required
            autoComplete="current-password"
            className="form-input text-sm"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-stone-400">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5"
          />
          上記の内容を理解した上で、退会を希望します
        </label>

        <button
          type="submit"
          disabled={loading || !confirmed || !password}
          className="w-full rounded-md border border-wine-light/60 bg-wine/30 px-4 py-3 text-sm font-semibold text-gold-light transition-colors hover:bg-wine/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "処理中…" : "退会する"}
        </button>

        <p className="text-center text-sm">
          <Link href="/home" className="text-stone-400 hover:text-gold-light hover:underline">
            やめておく(自室に戻る)
          </Link>
        </p>
      </form>
    </main>
  );
}
