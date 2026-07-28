"use client";

import { useRef, useState } from "react";
import { COMPANION_CONFIG } from "@/config/companion";
import {
  DEFAULT_EMOTION,
  parseEmotionText,
  parseEmotionTextStreaming,
  type CompanionEmotion,
} from "@/lib/companionEmotion";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion: CompanionEmotion;
};

type Props = {
  /** サーバー側で計算した残り会話回数(匿名Cookie単位、生涯上限) */
  initialRemaining: number;
};

/** 体験ページ(/experience)専用の「クロエお試しチャット」。会話は保存せず、匿名Cookie単位で生涯10回までに制限される */
export function CompanionTrialChat({ initialRemaining }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const latestEmotion =
    [...messages].reverse().find((m) => m.role === "assistant")?.emotion ?? DEFAULT_EMOTION;

  async function send() {
    const text = input.trim();
    if (!text || streaming || remaining <= 0) return;

    setError(null);
    setInput("");
    setStreaming(true);

    const historyForRequest = messages.map((m) => ({ role: m.role, content: m.content }));

    const userMsg: ChatMessage = { id: `local-u-${Date.now()}`, role: "user", content: text, emotion: DEFAULT_EMOTION };
    const assistantId = `local-a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "", emotion: DEFAULT_EMOTION }]);

    try {
      const res = await fetch("/api/companion/trial-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historyForRequest }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "送信に失敗しました");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId && m.id !== userMsg.id));
        setInput(text);
        return;
      }

      setRemaining((r) => Math.max(r - 1, 0));

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const { emotion, text: visible } = parseEmotionTextStreaming(acc);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: visible, emotion } : m)));
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
      const finalParsed = parseEmotionText(acc);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: finalParsed.text, emotion: finalParsed.emotion } : m))
      );
    } catch {
      setError("通信エラーが発生しました");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "チャットを閉じる" : `${COMPANION_CONFIG.name}と話す(体験版)`}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-gold/50 bg-gradient-to-br from-wine-light to-gold text-2xl shadow-gold transition-transform hover:scale-110"
      >
        {open ? "✕" : <CompanionAvatar emotion={latestEmotion} fallbackEmoji={COMPANION_CONFIG.emoji} sizeClass="h-14 w-14" className="!border-0" />}
      </button>

      {open && (
        <div className="fixed inset-x-3 bottom-24 z-40 mx-auto flex h-[65dvh] max-w-sm animate-fade-up flex-col overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-2xl sm:inset-x-auto sm:right-5 sm:w-96">
          <header className="flex items-center gap-2 border-b border-surface-border bg-surface-raised px-4 py-3">
            <CompanionAvatar emotion={latestEmotion} fallbackEmoji={COMPANION_CONFIG.emoji} sizeClass="h-9 w-9" />
            <div>
              <p className="mansion-title text-sm">{COMPANION_CONFIG.name}(体験版)</p>
              <p className="text-[10px] text-stone-500">
                {remaining > 0 ? `あと ${remaining} 回お話しできます` : "体験版の会話回数を使い切りました"}
              </p>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="pt-8 text-center text-xs text-stone-500">
                {COMPANION_CONFIG.name}に話しかけてみましょう。
                <br />
                副業の悩み、ちょっとした相談ごとなど…
                <br />
                (体験版のため、会話内容は保存されません)
              </p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && <CompanionAvatar emotion={m.emotion} fallbackEmoji={COMPANION_CONFIG.emoji} sizeClass="h-8 w-8" />}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "rounded-br-sm bg-gradient-to-r from-wine to-wine-light text-stone-100" : "rounded-bl-sm bg-surface-raised text-stone-200"
                  }`}
                >
                  {m.content || (
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.15s" }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.3s" }}>·</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="border-t border-surface-border bg-wine/20 px-4 py-2 text-xs text-gold-light">{error}</p>}

          {remaining > 0 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2 border-t border-surface-border p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力…"
                disabled={streaming}
                className="form-input flex-1 !py-2 text-sm"
              />
              <button type="submit" disabled={streaming || !input.trim()} className="neon-button !px-4 !py-2 text-sm">
                送信
              </button>
            </form>
          ) : (
            <div className="border-t border-surface-border p-3 text-center">
              <a href="/signup" className="neon-button block text-center text-sm">
                招待状を受け取って続きを話す
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
