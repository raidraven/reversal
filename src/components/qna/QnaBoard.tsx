"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEFAULT_SITE_TEXT } from "@/lib/siteTextDefaults";
import { EditableText } from "@/components/admin/EditableText";
import { Icon } from "@/components/Icon";

type AnswerItem = {
  id: string;
  content: string;
  authorName: string;
  rank: number;
  expAwarded: number;
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
};

type QuestionData = {
  id: string;
  content: string;
  authorName: string;
  isAiGenerated: boolean;
  alreadyAnswered: boolean;
  answers: AnswerItem[];
} | null;

type Props = {
  /** ログイン中かどうか。未ログインでは回答フォームを隠し、いいねのみ受け付ける */
  isLoggedIn: boolean;
};

export function QnaBoard({ isLoggedIn }: Props) {
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionData>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState(DEFAULT_SITE_TEXT["qna.board.title"]);

  useEffect(() => {
    fetch("/api/site-texts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.texts) return;
        if (data.texts["qna.board.title"]) setBoardTitle(data.texts["qna.board.title"]);
      })
      .catch(() => {
        /* デフォルト値のまま */
      });
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/questions/current");
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !answerText.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions/${question.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answerText }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "送信に失敗しました");
        return;
      }
      setAnswerText("");
      setResultMsg(`${data.rank}着での回答でした!+${data.expGained}経験値を授かりました`);
      await load();
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function like(answerId: string) {
    // 楽観的更新
    setQuestion((prev) =>
      prev
        ? {
            ...prev,
            answers: prev.answers.map((a) =>
              a.id === answerId
                ? { ...a, likedByMe: !a.likedByMe, likeCount: a.likeCount + (a.likedByMe ? -1 : 1) }
                : a
            ),
          }
        : prev
    );
    try {
      const res = await fetch(`/api/answers/${answerId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setQuestion((prev) =>
          prev
            ? {
                ...prev,
                answers: prev.answers.map((a) =>
                  a.id === answerId ? { ...a, likedByMe: data.liked, likeCount: data.likeCount } : a
                ),
              }
            : prev
        );
      }
    } catch {
      /* 楽観的更新のまま維持 */
    }
  }

  if (loading) {
    return <section className="game-card h-40 animate-pulse" />;
  }

  if (!question) {
    return (
      <section className="game-card">
        <h2 className="mansion-title flex items-center gap-1.5 text-base">
          <Icon name="question" size={18} />
          <EditableText siteTextKey="qna.board.title" value={boardTitle} />
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          まだ問いは立てられていません。「質問する」から問いを立ててみましょう。
        </p>
      </section>
    );
  }

  return (
    <section className="game-card space-y-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between">
        <h2 className="mansion-title flex items-center gap-1.5 text-base">
          <Icon name="question" size={18} />
          <EditableText siteTextKey="qna.board.title" value={boardTitle} />
        </h2>
        <span className="text-xs text-stone-500">
          出題: {question.authorName}
          {question.isAiGenerated && (
            <span className="ml-1 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] text-gold-light">
              AI自動出題
            </span>
          )}
        </span>
      </div>
      <p className="text-sm font-semibold text-stone-100">{question.content}</p>

      {error && (
        <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}
      {resultMsg && (
        <p className="rounded-md border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-gold-light">
          {resultMsg}
        </p>
      )}

      {!isLoggedIn && (
        <p className="rounded-md border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-stone-400">
          回答するには入館が必要です。
          <Link href="/signup" className="ml-1 font-semibold text-gold-light hover:underline">
            招待状を受け取る
          </Link>
        </p>
      )}

      {isLoggedIn && !question.alreadyAnswered && (
        <form onSubmit={submitAnswer} className="space-y-2">
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            required
            rows={3}
            maxLength={1000}
            placeholder="答えを書いてみましょう。速く答えるほど経験値が多くもらえます"
            className="form-input resize-none text-sm"
          />
          <button type="submit" disabled={submitting || !answerText.trim()} className="neon-button w-full">
            {submitting ? "送信中…" : "答える"}
          </button>
        </form>
      )}

      {question.answers.length > 0 && (
        <ul className="space-y-2">
          {question.answers.map((a) => (
            <li
              key={a.id}
              className={`rounded-md border p-3 text-sm ${
                a.isMine ? "border-gold/50 bg-gold/5" : "border-surface-border bg-surface-raised"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {a.rank}着 · {a.authorName}
                  {a.isMine && <span className="ml-1 text-gold-light">(あなた)</span>}
                </span>
                <span className="text-gold">+{a.expAwarded}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-stone-200">{a.content}</p>
              <button
                onClick={() => like(a.id)}
                className={`mt-2 flex items-center gap-1 text-xs transition-colors ${
                  a.likedByMe ? "text-gold-light" : "text-stone-500 hover:text-gold-light"
                }`}
              >
                <Icon name={a.likedByMe ? "heart-filled" : "heart-outline"} size={14} /> {a.likeCount}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
