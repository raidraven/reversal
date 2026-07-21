"use client";

import { useState } from "react";

type EditablePost = {
  id: string;
  title: string;
  content: string;
  revenueAmount: number | null;
};

export function EditPostForm({
  post,
  onSaved,
  onCancel,
}: {
  post: EditablePost;
  onSaved: (updated: { title: string; content: string; revenueAmount: number | null }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [revenueAmount, setRevenueAmount] = useState(post.revenueAmount?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          ...(revenueAmount.trim() ? { revenueAmount: Number(revenueAmount) } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "保存に失敗しました");
        return;
      }
      onSaved({ title, content, revenueAmount: revenueAmount.trim() ? Number(revenueAmount) : null });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} className="form-input text-sm" />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        maxLength={2000}
        className="form-input resize-none text-sm"
      />
      <input
        type="number"
        min={0}
        value={revenueAmount}
        onChange={(e) => setRevenueAmount(e.target.value)}
        placeholder="報告収益(円・任意)"
        className="form-input text-sm"
      />
      {error && <p className="text-xs text-gold-light">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !title.trim() || !content.trim()}
          className="ghost-button !px-3 !py-1.5 text-xs"
        >
          {saving ? "保存中…" : "保存する"}
        </button>
        <button onClick={onCancel} className="text-xs text-stone-500 hover:text-stone-300">
          キャンセル
        </button>
      </div>
    </div>
  );
}
