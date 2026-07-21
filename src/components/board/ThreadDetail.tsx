"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { PostComments } from "@/components/board/PostComments";
import { EditPostForm } from "@/components/board/EditPostForm";

type Comment = { id: string; authorName: string; content: string; createdAt: string };

type Props = {
  post: {
    id: string;
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
  comments: Comment[];
  isLoggedIn: boolean;
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ThreadDetail({ post: initialPost, comments, isLoggedIn }: Props) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  const [editing, setEditing] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  async function like() {
    setPost((prev) => ({
      ...prev,
      likedByMe: !prev.likedByMe,
      likeCount: prev.likeCount + (prev.likedByMe ? -1 : 1),
    }));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPost((prev) => ({ ...prev, likedByMe: data.liked, likeCount: data.likeCount }));
      }
    } catch {
      /* 楽観的更新のまま維持 */
    }
  }

  async function report() {
    if (!confirm("この投稿を通報しますか?不適切な投稿として運営に共有されます。")) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/report`, { method: "POST" });
      if (res.ok) setPost((prev) => ({ ...prev, reportedByMe: true }));
    } catch {
      /* 何もしない */
    }
  }

  async function removePost() {
    if (!confirm("このスレッドを削除しますか?元に戻せません。")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) router.push("/board");
  }

  return (
    <article className={`game-card space-y-3 ${post.authorIsAdmin ? "border-gold/60 bg-gold/5" : ""}`}>
      <p className="text-xs font-semibold text-gold-light">{formatDateTime(post.createdAt)}</p>
      <div className="flex items-center gap-1 text-xs text-stone-500">
        {post.authorName}
        {post.authorIsAdmin && (
          <span className="ml-1 inline-flex items-center gap-0.5 rounded-full border border-gold/50 bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold-light">
            <Icon name="candle" size={10} /> 運営
          </span>
        )}
        {post.isMine && <span className="ml-1 text-gold-light">(あなた)</span>}
      </div>

      {editing ? (
        <EditPostForm
          post={post}
          onCancel={() => setEditing(false)}
          onSaved={(updated) => {
            setPost((prev) => ({ ...prev, ...updated }));
            setEditing(false);
          }}
        />
      ) : (
        <>
          <h1 className="mansion-title text-lg">{post.title}</h1>
          <p className="whitespace-pre-wrap text-sm text-stone-300">{post.content}</p>
          {post.revenueAmount != null && (
            <p className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold-light">
              <Icon name="coin" size={14} /> {post.revenueAmount.toLocaleString()}円達成
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={like}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  post.likedByMe ? "text-gold-light" : "text-stone-500 hover:text-gold-light"
                }`}
              >
                <Icon name={post.likedByMe ? "heart-filled" : "heart-outline"} size={14} /> {post.likeCount}
              </button>
              <span className="flex items-center gap-1 text-xs text-stone-500">
                <Icon name="talk" size={14} /> {commentCount}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {post.isMine ? (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-[10px] text-stone-500 transition-colors hover:text-gold-light"
                  >
                    <Icon name="pencil" size={12} /> 編集
                  </button>
                  <button
                    onClick={removePost}
                    className="flex items-center gap-1 text-[10px] text-stone-500 transition-colors hover:text-wine-light"
                  >
                    削除
                  </button>
                </>
              ) : (
                isLoggedIn && (
                  <button
                    onClick={report}
                    disabled={post.reportedByMe}
                    className="flex items-center gap-1 text-[10px] text-stone-600 transition-colors hover:text-wine-light disabled:cursor-default disabled:hover:text-stone-600"
                  >
                    {post.reportedByMe ? "通報済み" : (
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

      <PostComments
        postId={post.id}
        isLoggedIn={isLoggedIn}
        initialComments={comments}
        onPosted={() => setCommentCount((c) => c + 1)}
      />
    </article>
  );
}
