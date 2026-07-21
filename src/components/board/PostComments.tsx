"use client";

import { useEffect, useState } from "react";

type Comment = { id: string; authorName: string; content: string; createdAt: string };

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function PostComments({
  postId,
  isLoggedIn,
  onPosted,
  initialComments,
}: {
  postId: string;
  isLoggedIn: boolean;
  onPosted: () => void;
  /** すでに一覧を持っている場合(スレッド個別ページ)に渡すと、初回フェッチをスキップする */
  initialComments?: Comment[];
}) {
  const [comments, setComments] = useState<Comment[] | null>(initialComments ?? null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialComments) return;
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setComments(data?.comments ?? []))
      .catch(() => setComments([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: name.trim() || undefined, content }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "投稿に失敗しました");
        return;
      }
      setComments((prev) => [...(prev ?? []), data.comment]);
      setContent("");
      onPosted();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-surface-border pt-2">
      {comments === null ? (
        <p className="text-xs text-stone-600">読み込み中…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-stone-600">まだコメントはありません。</p>
      ) : (
        <ul className="space-y-1.5">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md bg-surface-card p-2">
              <div className="flex items-center justify-between text-[10px] text-stone-500">
                <span className="font-semibold text-stone-300">{c.authorName}</span>
                <span>{formatDateTime(c.createdAt)}</span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap text-xs text-stone-200">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-[10px] text-gold-light">{error}</p>}

      <form onSubmit={submit} className="space-y-1.5">
        {!isLoggedIn && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="お名前(任意・空欄なら「匿名の来賓」)"
            maxLength={50}
            className="form-input !py-1 text-xs"
          />
        )}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="コメントする"
            maxLength={1000}
            className="form-input !py-1 flex-1 text-xs"
          />
          <button
            type="submit"
            disabled={posting || !content.trim()}
            className="ghost-button shrink-0 !px-3 !py-1 text-xs"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
