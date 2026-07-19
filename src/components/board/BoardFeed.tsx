"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  POST_CATEGORIES,
  POST_CATEGORY_ICONS,
  POST_CATEGORY_LABELS,
  type PostCategory,
} from "@/lib/boardCategories";
import { Icon } from "@/components/Icon";
import { EditableText } from "@/components/admin/EditableText";

type PostItem = {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  revenueAmount: number | null;
  authorName: string;
  authorIsAdmin: boolean;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  isMine: boolean;
  reportedByMe: boolean;
};

type Comment = { id: string; authorName: string; content: string; createdAt: string };

type Props = {
  isLoggedIn: boolean;
  emptyMessage?: string;
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const TABS: Array<{ key: PostCategory | "all"; label: string }> = [
  { key: "all", label: "すべて" },
  ...POST_CATEGORIES.map((c) => ({ key: c, label: POST_CATEGORY_LABELS[c] })),
];

function PostComments({
  postId,
  isLoggedIn,
  onPosted,
}: {
  postId: string;
  isLoggedIn: boolean;
  onPosted: () => void;
}) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setComments(data?.comments ?? []))
      .catch(() => setComments([]));
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

export function BoardFeed({ isLoggedIn, emptyMessage = "まだ投稿がありません。最初の一件を届けてみましょう。" }: Props) {
  const [tab, setTab] = useState<PostCategory | "all">("all");
  const [posts, setPosts] = useState<PostItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);

  async function load(category: PostCategory | "all") {
    setLoading(true);
    try {
      const query = category === "all" ? "" : `?category=${category}`;
      const res = await fetch(`/api/posts${query}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function like(postId: string) {
    setPosts((prev) =>
      prev
        ? prev.map((p) =>
            p.id === postId
              ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }
              : p
          )
        : prev
    );
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev
            ? prev.map((p) =>
                p.id === postId ? { ...p, likedByMe: data.liked, likeCount: data.likeCount } : p
              )
            : prev
        );
      }
    } catch {
      /* 楽観的更新のまま維持 */
    }
  }

  async function report(postId: string) {
    if (!confirm("この投稿を通報しますか?不適切な投稿として運営に共有されます。")) return;
    try {
      const res = await fetch(`/api/posts/${postId}/report`, { method: "POST" });
      if (res.ok) {
        setPosts((prev) =>
          prev ? prev.map((p) => (p.id === postId ? { ...p, reportedByMe: true } : p)) : prev
        );
      }
    } catch {
      /* 何もしない */
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                tab === t.key
                  ? "border-gold bg-gold/15 text-gold-light"
                  : "border-surface-border text-stone-400 hover:border-gold/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Link href="/board/new" className="ghost-button !px-3 !py-2 text-xs">
          投稿する
        </Link>
      </div>

      {loading && <div className="game-card h-24 animate-pulse" />}

      {!loading && posts && posts.length === 0 && (
        <p className="game-card text-sm text-stone-500">
          <EditableText siteTextKey="board.emptyMessage" value={emptyMessage} />
        </p>
      )}

      {!loading && posts && posts.length > 0 && (
        <ul className="space-y-2">
          {posts.map((p) => (
            <li
              key={p.id}
              className={`game-card space-y-2 ${
                p.authorIsAdmin ? "border-gold/60 bg-gold/5" : ""
              }`}
            >
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <Icon name={POST_CATEGORY_ICONS[p.category]} size={14} />
                  {POST_CATEGORY_LABELS[p.category]} · {p.authorName}
                  {p.authorIsAdmin && (
                    <span className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-gold/50 bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold-light">
                      <Icon name="candle" size={10} /> 運営
                    </span>
                  )}
                  {p.isMine && <span className="ml-1 text-gold-light">(あなた)</span>}
                </span>
                <span className="shrink-0 text-[10px] text-stone-600">{formatDateTime(p.createdAt)}</span>
              </div>
              <p className="text-sm font-semibold text-stone-100">{p.title}</p>
              <p className="whitespace-pre-wrap text-sm text-stone-300">{p.content}</p>
              {p.revenueAmount != null && (
                <p className="flex items-center gap-1 text-xs font-bold text-gold-light">
                  <Icon name="coin" size={14} /> 報告収益: {p.revenueAmount.toLocaleString()}円
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => like(p.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      p.likedByMe ? "text-gold-light" : "text-stone-500 hover:text-gold-light"
                    }`}
                  >
                    <Icon name={p.likedByMe ? "heart-filled" : "heart-outline"} size={14} /> {p.likeCount}
                  </button>
                  <button
                    onClick={() => setOpenCommentsId(openCommentsId === p.id ? null : p.id)}
                    className="flex items-center gap-1 text-xs text-stone-500 transition-colors hover:text-gold-light"
                  >
                    <Icon name="talk" size={14} /> {p.commentCount}
                  </button>
                </div>
                {isLoggedIn && !p.isMine && (
                  <button
                    onClick={() => report(p.id)}
                    disabled={p.reportedByMe}
                    className="flex items-center gap-1 text-[10px] text-stone-600 transition-colors hover:text-wine-light disabled:cursor-default disabled:hover:text-stone-600"
                  >
                    {p.reportedByMe ? (
                      "通報済み"
                    ) : (
                      <>
                        <Icon name="flag" size={12} /> 通報する
                      </>
                    )}
                  </button>
                )}
              </div>

              {openCommentsId === p.id && (
                <PostComments
                  postId={p.id}
                  isLoggedIn={isLoggedIn}
                  onPosted={() =>
                    setPosts((prev) =>
                      prev
                        ? prev.map((x) => (x.id === p.id ? { ...x, commentCount: x.commentCount + 1 } : x))
                        : prev
                    )
                  }
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
