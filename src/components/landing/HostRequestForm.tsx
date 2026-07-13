"use client";

import { useState } from "react";

type Props = {
  placeholder: string;
  completedMessage: string;
};

export function HostRequestForm({ placeholder, completedMessage }: Props) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    setStatus("sending");

    try {
      const res = await fetch("/api/host-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, name: name.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "送信に失敗しました");
        setStatus("idle");
        return;
      }

      setContent("");
      setStatus("sent");
    } catch {
      setError("通信エラーが発生しました");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return <div className="game-card text-sm text-gold-light">{completedMessage}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="お名前(任意・空欄なら「匿名の来賓」)"
        maxLength={50}
        className="form-input text-sm"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        maxLength={2000}
        rows={4}
        placeholder={placeholder}
        className="form-input resize-none text-sm"
      />
      <button
        type="submit"
        disabled={status === "sending" || !content.trim()}
        className="neon-button w-full"
      >
        {status === "sending" ? "送信中…" : "要望を届ける"}
      </button>
    </form>
  );
}
