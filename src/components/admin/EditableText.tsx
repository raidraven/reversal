"use client";

import { useEffect, useState } from "react";
import { useEditMode } from "@/components/admin/EditModeProvider";

type Props = {
  /** SiteTextのキー(管理ページの「文言・アイコンの編集」と同じ項目) */
  siteTextKey: string;
  value: string;
  as?: "span" | "div" | "p" | "h1" | "h2";
  className?: string;
  multiline?: boolean;
};

/**
 * 管理者の「編集モード」がONの間、その場でクリックして書き換え・保存できるテキスト。
 * OFFの間、または管理者以外には、これまで通りの静的テキストとして表示される
 */
export function EditableText({ siteTextKey, value, as: Tag = "span", className = "", multiline = false }: Props) {
  const { editMode } = useEditMode();
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  if (!editMode) {
    return <Tag className={className}>{text}</Tag>;
  }

  async function save() {
    if (text === value) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/site-texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: { [siteTextKey]: text } }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    } finally {
      setSaving(false);
    }
  }

  const sharedClassName = `${className} w-full min-w-0 rounded border border-dashed border-gold/60 bg-gold/5 px-1 outline-none focus:border-gold`;

  return (
    <span className="relative inline-block w-full max-w-full align-top">
      {multiline ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          rows={3}
          className={sharedClassName}
        />
      ) : (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          className={sharedClassName}
        />
      )}
      {saving && <span className="absolute -top-4 right-0 text-[10px] text-stone-500">保存中…</span>}
      {saved && <span className="absolute -top-4 right-0 text-[10px] text-gold-light">✓ 保存しました</span>}
    </span>
  );
}
