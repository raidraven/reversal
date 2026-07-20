"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditMode } from "@/components/admin/EditModeProvider";

type Props = {
  articleId: string;
  title: string;
  description: string;
  content: string;
  category: "guide" | "novel";
  published: boolean;
  html: string;
  publishedLabel: string | null;
};

const FIELD_CLASS =
  "w-full rounded border border-dashed border-gold/60 bg-gold/5 px-2 py-1.5 text-stone-100 outline-none focus:border-gold";

/**
 * 書庫の記事本体(タイトル・説明文・本文)を編集モードでその場編集できるようにする。
 * OFF時はこれまで通り、サーバーでレンダリング済みのMarkdown HTMLをそのまま表示する
 */
export function EditableArticle({
  articleId,
  title,
  description,
  content,
  category,
  published,
  html,
  publishedLabel,
}: Props) {
  const { editMode } = useEditMode();
  const router = useRouter();
  const [t, setT] = useState(title);
  const [d, setD] = useState(description);
  const [c, setC] = useState(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!editMode) {
    return (
      <>
        <header className="border-b border-surface-border pb-4">
          <h1 className="mansion-title text-2xl">{title}</h1>
          {publishedLabel && <p className="mt-2 text-xs text-stone-500">{publishedLabel}</p>}
        </header>
        {/* 記事は管理者のみが執筆するため、生成HTMLをそのまま描画する */}
        <div className="article-body mt-6" dangerouslySetInnerHTML={{ __html: html }} />
      </>
    );
  }

  async function save() {
    if (t === title && d === description && c === content) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, description: d, content: c, category, published }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "保存に失敗しました");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2 border-b border-surface-border pb-4">
      <input
        value={t}
        onChange={(e) => setT(e.target.value)}
        onBlur={save}
        placeholder="タイトル"
        className={`${FIELD_CLASS} font-serif text-xl text-gold-light`}
      />
      <textarea
        value={d}
        onChange={(e) => setD(e.target.value)}
        onBlur={save}
        rows={2}
        placeholder="説明文(空欄なら本文から自動生成)"
        className={`${FIELD_CLASS} text-xs`}
      />
      <textarea
        value={c}
        onChange={(e) => setC(e.target.value)}
        onBlur={save}
        rows={18}
        placeholder="本文(Markdown)"
        className={`${FIELD_CLASS} font-mono text-xs`}
      />
      <div className="flex items-center gap-2 text-[10px]">
        {saving && <span className="text-stone-500">保存中…</span>}
        {saved && <span className="text-gold-light">✓ 保存しました</span>}
        {error && <span className="text-wine-light">{error}</span>}
      </div>
    </div>
  );
}
