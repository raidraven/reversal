"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PostCategory } from "@/lib/boardCategories";
import { Icon } from "@/components/Icon";
import { EditableText } from "@/components/admin/EditableText";
import { PostComments } from "@/components/board/PostComments";
import { EditPostForm } from "@/components/board/EditPostForm";

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

type Props = {
  isLoggedIn: boolean;
  emptyMessage?: string;
};

type Sort = "new" | "top";

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function BoardFeed({ isLoggedIn, emptyMessage = "まだ投稿がありません。最初の一件を届けてみましょう。" }: Props) {
  const [posts, setPosts] = useState<PostItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("new");

  async function load(nextPage: number, q: string, s: Sort, append: boolean) {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage), sort: s });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => (append && prev ? [...prev, ...data.posts] : data.posts));
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // 検索・並び替えが変わったら1ページ目から取り直す(デバウンス)
  useEffect(() => {
    const t = setTimeout(() => load(1, query, sort, false), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort]);

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

  async function removePost(postId: string) {
    if (!confirm("このスレッドを削除しますか?元に戻せません。")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => (prev ? prev.filter((p) => p.id !== postId) : prev));
      }
    } catch {
      /* 何もしない */
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setSort("new")}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            sort === "new" ? "border-gold bg-gold/15 text-gold-light" : "border-surface-border text-stone-400"
          }`}
        >
          新着
        </button>
        <button
          onClick={() => setSort("top")}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            sort === "top" ? "border-gold bg-gold/15 text-gold-light" : "border-surface-border text-stone-400"
          }`}
        >
          人気
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="スレッドを検索"
          className="form-input !py-1.5 max-w-[220px] flex-1 text-xs"
        />

        <Link href="/board/new" className="ghost-button !px-3 !py-2 text-xs">
          スレッドを立てる
        </Link>
      </div>

      {loading && <div className="game-card h-24 animate-pulse" />}

      {!loading && posts && posts.length === 0 && (
        <p className="game-card text-sm text-stone-500">
          {query.trim() ? (
            "一致するスレッドが見つかりませんでした。"
          ) : (
            <EditableText siteTextKey="board.emptyMessage" value={emptyMessage} />
          )}
        </p>
      )}

      {!loading && posts && posts.length > 0 && (
        <ul className="relative ml-3 space-y-5 border-l border-surface-border pl-6">
          {posts.map((p) => (
            <li key={p.id} className="relative">
              {/* タイムラインの目印(実況ログの記録点) */}
              <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-gold" />
              <p className="mb-1.5 text-xs font-semibold text-gold-light">{formatDateTime(p.createdAt)}</p>

              <div
                className={`game-card space-y-2 ${
                  p.authorIsAdmin ? "border-gold/60 bg-gold/5" : ""
                }`}
              >
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  {p.authorName}
                  {p.authorIsAdmin && (
                    <span className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-gold/50 bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold-light">
                      <Icon name="candle" size={10} /> 運営
                    </span>
                  )}
                  {p.isMine && <span className="ml-1 text-gold-light">(あなた)</span>}
                </div>

                {editingId === p.id ? (
                  <EditPostForm
                    post={p}
                    onCancel={() => setEditingId(null)}
                    onSaved={(updated) => {
                      setPosts((prev) =>
                        prev ? prev.map((x) => (x.id === p.id ? { ...x, ...updated } : x)) : prev
                      );
                      setEditingId(null);
                    }}
                  />
                ) : (
                  <>
                    <Link href={`/board/${p.id}`} className="block text-sm font-semibold text-stone-100 hover:text-gold-light">
                      {p.title}
                    </Link>
                    <p className="whitespace-pre-wrap text-sm text-stone-300">{p.content}</p>
                    {p.revenueAmount != null && (
                      <p className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold-light">
                        <Icon name="coin" size={14} /> {p.revenueAmount.toLocaleString()}円達成
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
                      <div className="flex items-center gap-3">
                        {p.isMine ? (
                          <>
                            <button
                              onClick={() => setEditingId(p.id)}
                              className="flex items-center gap-1 text-[10px] text-stone-500 transition-colors hover:text-gold-light"
                            >
                              <Icon name="pencil" size={12} /> 編集
                            </button>
                            <button
                              onClick={() => removePost(p.id)}
                              className="flex items-center gap-1 text-[10px] text-stone-500 transition-colors hover:text-wine-light"
                            >
                              削除
                            </button>
                          </>
                        ) : (
                          isLoggedIn && (
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
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}

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
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && hasMore && (
        <button
          onClick={() => load(page + 1, query, sort, true)}
          disabled={loadingMore}
          className="ghost-button w-full text-xs"
        >
          {loadingMore ? "読み込み中…" : "もっと見る"}
        </button>
      )}
    </section>
  );
}
