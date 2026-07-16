"use client";

import { useState } from "react";

type Props = {
  userId: string;
  siteUrl: string;
  initialCardPublic: boolean;
  referralCount: number;
};

export function CardSettingsPanel({ userId, siteUrl, initialCardPublic, referralCount }: Props) {
  const [cardPublic, setCardPublic] = useState(initialCardPublic);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralLink = `${siteUrl}/signup?ref=${userId}`;
  const cardLink = `${siteUrl}/card/${userId}`;

  async function handleChange(next: boolean) {
    setCardPublic(next);
    setSaving(true);
    try {
      await fetch("/api/account/card-visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardPublic: next }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードAPIが使えない環境ではボタンだけ反応させ、選択コピーに委ねる
    }
  }

  return (
    <section className="game-card space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-stone-200">会員証の公開設定</p>
        <select
          value={cardPublic ? "public" : "private"}
          onChange={(e) => handleChange(e.target.value === "public")}
          disabled={saving}
          className="form-input w-auto !py-1.5 text-xs"
        >
          <option value="private">非公開</option>
          <option value="public">公開</option>
        </select>
      </div>
      {cardPublic && (
        <p className="text-xs text-stone-500">
          公開中: 誰でも{" "}
          <a href={cardLink} target="_blank" rel="noreferrer" className="text-gold-light hover:underline">
            {cardLink}
          </a>{" "}
          から閲覧できます
        </p>
      )}

      <div className="border-t border-surface-border pt-3">
        <p className="text-sm font-semibold text-stone-200">紹介リンク</p>
        <p className="mt-1 text-xs text-stone-500">
          このリンク経由で入館した人数: <span className="text-gold-light">{referralCount}</span> 名
        </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            readOnly
            value={referralLink}
            onFocus={(e) => e.target.select()}
            className="form-input min-w-0 flex-1 !py-1.5 text-xs"
          />
          <button onClick={copyLink} className="ghost-button shrink-0 !px-3 !py-1.5 text-xs">
            {copied ? "コピーしました" : "コピー"}
          </button>
        </div>
      </div>
    </section>
  );
}
