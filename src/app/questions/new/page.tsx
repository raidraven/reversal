"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEFAULT_SITE_TEXT } from "@/lib/siteTextDefaults";

export default function NewQuestionPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backLabel, setBackLabel] = useState(DEFAULT_SITE_TEXT["room.backLabel"]);

  useEffect(() => {
    fetch("/api/site-texts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.texts?.["room.backLabel"]) setBackLabel(data.texts["room.backLabel"]);
      })
      .catch(() => {
        /* デフォルト値のまま */
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "送信に失敗しました");
        setLoading(false);
        return;
      }
      router.push("/questions");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="game-card w-full max-w-sm space-y-4 animate-fade-up">
        <div className="text-center">
          <p className="text-3xl">🖋️</p>
          <h1 className="mansion-title mt-2 text-2xl">問いを立てる</h1>
          <p className="mt-1 text-sm text-stone-400">この問いが、今宵の一問一答になります</p>
        </div>

        {error && (
          <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-sm text-gold-light">
            {error}
          </p>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4}
          maxLength={500}
          placeholder="他の来賓に問いかけたいことを書いてください"
          className="form-input resize-none"
        />

        <button type="submit" disabled={loading || !content.trim()} className="neon-button w-full">
          {loading ? "送信中…" : "問いを立てる"}
        </button>

        <p className="text-center text-sm">
          <Link href="/home" className="text-stone-400 hover:text-gold-light hover:underline">
            {backLabel}
          </Link>
        </p>
      </form>
    </main>
  );
}
