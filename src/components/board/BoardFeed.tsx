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
  isMine: boolean;
  reportedByMe: boolean;
};

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

export function BoardFeed({ isLoggedIn, emptyMessage = "まだ投稿がありません。最初の一件を届けてみましょう。" }: Props) {
  const [tab, setTab] = useState<PostCategory | "all">("all");
  const [posts, setPosts] = useState<PostItem[] | null>(null);
  const [loading, setLoading] = useState(true);

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

        {isLoggedIn ? (
          <Link href="/board/new" className="ghost-button !px-3 !py-2 text-xs">
            投稿する
          </Link>
        ) : (
          <Link href="/signup" className="ghost-button !px-3 !py-2 text-xs">
            招待状を受け取って投稿する
          </Link>
        )}
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
                <button
                  onClick={() => like(p.id)}
                  className={`flex items-center gap-1 text-xs transition-colors ${
                    p.likedByMe ? "text-gold-light" : "text-stone-500 hover:text-gold-light"
                  }`}
                >
                  <Icon name={p.likedByMe ? "heart-filled" : "heart-outline"} size={14} /> {p.likeCount}
                </button>
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
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
