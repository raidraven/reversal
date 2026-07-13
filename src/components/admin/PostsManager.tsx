"use client";

import { useEffect, useState } from "react";
import { POST_CATEGORY_LABELS, type PostCategory } from "@/lib/boardCategories";

type AdminPost = {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  revenueAmount: number | null;
  authorName: string;
  authorId: string;
  authorBanned: boolean;
  createdAt: string;
  reportCount: number;
};

export function PostsManager() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/posts");
    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "削除に失敗しました");
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnban(authorId: string) {
    setBusyId(authorId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${authorId}/unban`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "解除に失敗しました");
        return;
      }
      setPosts((prev) => prev.map((p) => (p.authorId === authorId ? { ...p, authorBanned: false } : p)));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <section className="game-card animate-pulse h-40" />;

  return (
    <section className="game-card">
      <h2 className="mansion-title text-lg">談話室の投稿管理</h2>
      <p className="mt-1 text-xs text-stone-500">
        投稿の削除、および通報の積み重ねで自動追放されたユーザーの追放解除ができます(全 {posts.length} 件)。
      </p>

      {error && (
        <p className="mt-3 rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}

      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">まだ投稿はありません。</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="rounded-md border border-surface-border bg-surface-raised p-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {POST_CATEGORY_LABELS[p.category]} · {p.authorName}
                  {p.authorBanned && (
                    <span className="ml-1 rounded-full bg-wine/30 px-1.5 py-0.5 text-[10px] text-gold-light">
                      追放済み
                    </span>
                  )}
                </span>
                {p.reportCount > 0 && (
                  <span className="rounded-full bg-wine/20 px-1.5 py-0.5 text-[10px] text-gold-light">
                    通報 {p.reportCount} 件
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-stone-100">{p.title}</p>
              <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-stone-400">{p.content}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={busyId === p.id}
                  className="rounded-md border border-wine-light/50 px-3 py-1.5 text-xs text-gold-light transition-colors hover:bg-wine/20"
                >
                  投稿を削除
                </button>
                {p.authorBanned && (
                  <button
                    onClick={() => handleUnban(p.authorId)}
                    disabled={busyId === p.authorId}
                    className="ghost-button !px-3 !py-1.5 text-xs"
                  >
                    追放解除
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
