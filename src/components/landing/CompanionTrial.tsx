"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COMPANION_CONFIG } from "@/config/companion";
import {
  DEFAULT_EMOTION,
  parseEmotionText,
  parseEmotionTextStreaming,
  type CompanionEmotion,
} from "@/lib/companionEmotion";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";

type TrialMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion: CompanionEmotion;
};

/** LPの未登録来訪者向け「クロエお試しチャット」。会話は保存されず、残り回数のみサーバー側で管理する */
export function CompanionTrial() {
  const [messages, setMessages] = useState<TrialMessage[]>([]);
  const [input, setInput] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/companion/trial")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.remaining != null) setRemaining(data.remaining);
      })
      .catch(() => {
        /* 未取得のまま(送信時に確定する) */
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const latestEmotion =
    [...messages].reverse().find((m) => m.role === "assistant")?.emotion ?? DEFAULT_EMOTION;
  const exhausted = remaining !== null && remaining <= 0;

  async function send() {
    const text = input.trim();
    if (!text || streaming || exhausted) return;

    setError(null);
    setInput("");
    setStreaming(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg: TrialMessage = { id: `t-u-${Date.now()}`, role: "user", content: text, emotion: DEFAULT_EMOTION };
    const assistantId = `t-a-${Date.now()}`;
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "", emotion: DEFAULT_EMOTION }]);

    try {
      const res = await fetch("/api/companion/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "送信に失敗しました");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId && m.id !== userMsg.id));
        setInput(text);
        if (res.status === 429) setRemaining(0);
        return;
      }

      const headerRemaining = res.headers.get("X-Trial-Remaining");
      if (headerRemaining != null) setRemaining(Number(headerRemaining));

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
    }
  }

  return (
    <section className="game-card space-y-3">
      <div className="flex items-center gap-2">
        <CompanionAvatar emotion={latestEmotion} fallbackEmoji={COMPANION_CONFIG.emoji} sizeClass="h-9 w-9" />
        <div>
          <p className="mansion-title text-sm">{COMPANION_CONFIG.name}にお試しで話しかける</p>
          <p className="text-[10px] text-stone-500">
            {remaining !== null ? `あと ${remaining} 回、入館せずにお話しできます` : "館の執事"}
          </p>
        </div>
      </div>

      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-surface-border bg-surface-raised p-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <CompanionAvatar emotion={m.emotion} fallbackEmoji={COMPANION_CONFIG.emoji} sizeClass="h-6 w-6" />
              )}
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-1.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-gradient-to-r from-wine to-wine-light text-stone-100"
                    : "rounded-bl-sm bg-surface-card text-stone-200"
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
      )}

      {error && (
        <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">{error}</p>
      )}

      {exhausted ? (
        <Link href="/signup" className="neon-button block text-center text-sm">
          お試しはここまで。招待状を受け取って続きを話す
        </Link>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="AI副業の悩みを話しかけてみてください…"
            disabled={streaming}
            className="form-input flex-1 !py-2 text-sm"
          />
          <button type="submit" disabled={streaming || !input.trim()} className="neon-button !px-4 !py-2 text-sm">
            送信
          </button>
        </form>
      )}
    </section>
  );
}
