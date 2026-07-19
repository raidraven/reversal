"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POST_CATEGORIES, POST_CATEGORY_LABELS, type PostCategory } from "@/lib/boardCategories";
import { Icon } from "@/components/Icon";

type Props = {
  boardName: string;
  isLoggedIn: boolean;
};

export function NewPostForm({ boardName, isLoggedIn }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<PostCategory>("achievement");
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [revenueAmount, setRevenueAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          content,
          ...(!isLoggedIn && authorName.trim() ? { authorName: authorName.trim() } : {}),
          ...(category === "achievement" && revenueAmount.trim()
            ? { revenueAmount: Number(revenueAmount) }
            : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "送信に失敗しました");
        setLoading(false);
        return;
      }
      router.push("/board");
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
          <p className="flex justify-center">
            <Icon name="talk" size={32} />
          </p>
          <h1 className="mansion-title mt-2 text-2xl">{boardName}へ投稿</h1>
          <p className="mt-1 text-sm text-stone-400">仲間の来賓に、実績や学びを届けましょう</p>
        </div>

        {error && (
          <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-sm text-gold-light">
            {error}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {POST_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-md border py-2 text-xs transition-colors ${
                category === c
                  ? "border-gold bg-gold/15 text-gold-light"
                  : "border-surface-border bg-surface-raised text-stone-300 hover:border-gold/40"
              }`}
            >
              {POST_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {!isLoggedIn && (
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={50}
            placeholder="お名前(任意・空欄なら「匿名の来賓」)"
            className="form-input"
          />
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={60}
          placeholder="タイトル"
          className="form-input"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          maxLength={2000}
          placeholder="内容を書いてください"
          className="form-input resize-none"
        />

        {category === "achievement" && (
          <div className="space-y-1">
            <label htmlFor="revenue" className="text-xs text-stone-400">
              報告収益(円・任意)
            </label>
            <input
              id="revenue"
              type="number"
              min={0}
              step={1}
              value={revenueAmount}
              onChange={(e) => setRevenueAmount(e.target.value)}
              placeholder="例: 1000"
              className="form-input text-sm"
            />
          </div>
        )}

        <button type="submit" disabled={loading || !title.trim() || !content.trim()} className="neon-button w-full">
          {loading ? "送信中…" : "投稿する"}
        </button>
        <p className="text-center text-[10px] text-stone-600">
          経験値の付与は1日1回までです。2件目以降も投稿自体は可能です。
        </p>

        <p className="text-center text-sm">
          <Link href="/board" className="text-stone-400 hover:text-gold-light hover:underline">
            {boardName}へ戻る
          </Link>
        </p>
      </form>
    </main>
  );
}
