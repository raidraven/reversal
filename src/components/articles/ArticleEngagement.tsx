"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

type Comment = { id: string; authorName: string; content: string; createdAt: string };

type Props = {
  slug: string;
  initialLikeCount: number;
  initialLikedByMe: boolean;
  initialComments: Comment[];
  isLoggedIn: boolean;
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ArticleEngagement({ slug, initialLikeCount, initialLikedByMe, initialComments, isLoggedIn }: Props) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likedByMe, setLikedByMe] = useState(initialLikedByMe);
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function like() {
    setLikedByMe((v) => !v);
    setLikeCount((c) => c + (likedByMe ? -1 : 1));
    try {
      const res = await fetch(`/api/articles/${slug}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikedByMe(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch {
      /* 楽観的更新のまま維持 */
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: name.trim() || undefined, content }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "投稿に失敗しました");
        return;
      }
      setComments((prev) => [...prev, data.comment]);
      setContent("");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mt-6 space-y-4 border-t border-surface-border pt-6">
      <button
        onClick={like}
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          likedByMe ? "text-gold-light" : "text-stone-400 hover:text-gold-light"
        }`}
      >
        <Icon name={likedByMe ? "heart-filled" : "heart-outline"} size={16} /> {likeCount}
      </button>

      <div>
        <h2 className="mansion-title text-base">コメント({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="mt-2 text-xs text-stone-500">まだコメントはありません。最初の一件を残してみましょう。</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="rounded-md border border-surface-border bg-surface-raised p-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-stone-300">{c.authorName}</span>
                  <span>{formatDateTime(c.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-stone-200">{c.content}</p>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="mt-2 rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
            {error}
          </p>
        )}

        <form onSubmit={submitComment} className="mt-3 space-y-2">
          {!isLoggedIn && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="お名前(任意・空欄なら「匿名の来賓」)"
              maxLength={50}
              className="form-input text-sm"
            />
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="感想やコメントを書く"
            maxLength={1000}
            rows={3}
            className="form-input resize-none text-sm"
          />
          <button
            type="submit"
            disabled={posting || !content.trim()}
            className="ghost-button !px-4 !py-2 text-xs"
          >
            {posting ? "投稿中…" : "コメントする"}
          </button>
        </form>
      </div>
    </div>
  );
}
