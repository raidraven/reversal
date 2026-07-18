"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { EditableText } from "@/components/admin/EditableText";

type Props = {
  title: string;
  subtitle: string;
};

export function LoginPanel({ title, subtitle }: Props) {
  const router = useRouter();
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
      } else if (result.error === "server_error") {
        setError("一時的な通信エラーが発生しました。お手数ですがもう一度お試しください");
      } else {
        setError("メールアドレスまたはパスワードが正しくありません");
      }
      return;
    }
    await fetch("/api/likes/merge-anon", { method: "POST" }).catch(() => {});
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="game-card space-y-4 animate-fade-up">
      <div className="text-center">
        <p className="flex justify-center">
          <Icon name="candle" size={24} />
        </p>
        <h2 className="mansion-title mt-1 text-lg">
          <EditableText siteTextKey="login.title" value={title} />
        </h2>
        <p className="mt-1 text-xs text-stone-400">
          <EditableText siteTextKey="login.subtitle" value={subtitle} />
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="lp-email" className="text-xs text-stone-400">
            メールアドレス
          </label>
          <input
            id="lp-email"
            type="email"
            required
            autoComplete="email"
            className="form-input text-sm"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="lp-password" className="text-xs text-stone-400">
            パスワード
          </label>
          <input
            id="lp-password"
            type="password"
            required
            autoComplete="current-password"
            className="form-input text-sm"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="neon-button w-full">
          {loading ? "扉を開いております…" : "扉を開く"}
        </button>
      </form>

      <p className="text-center text-xs">
        <Link href="/forgot-password" className="text-stone-400 hover:text-gold-light hover:underline">
          パスワードをお忘れですか?
        </Link>
      </p>

      <Link href="/signup" className="neon-button block text-center">
        招待状を受け取る
      </Link>
    </div>
  );
}
