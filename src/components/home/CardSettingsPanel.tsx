"use client";

import { useState } from "react";

type LinkField = { label: string; url: string };

type Props = {
  userId: string;
  siteUrl: string;
  initialCardPublic: boolean;
  referralCount: number;
  initialBio?: string | null;
  initialLink1?: LinkField;
  initialLink2?: LinkField;
};

const BIO_MAX = 150;

export function CardSettingsPanel({
  userId,
  siteUrl,
  initialCardPublic,
  referralCount,
  initialBio,
  initialLink1,
  initialLink2,
}: Props) {
  const [cardPublic, setCardPublic] = useState(initialCardPublic);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [bio, setBio] = useState(initialBio ?? "");
  const [link1, setLink1] = useState<LinkField>(initialLink1 ?? { label: "", url: "" });
  const [link2, setLink2] = useState<LinkField>(initialLink2 ?? { label: "", url: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

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

  async function saveProfile() {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const res = await fetch("/api/account/profile-card", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          link1Label: link1.label,
          link1Url: link1.url,
          link2Label: link2.label,
          link2Url: link2.url,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setProfileError(data?.error ?? "保存に失敗しました");
        return;
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {
      setProfileError("通信エラーが発生しました");
    } finally {
      setProfileSaving(false);
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

      <div className="border-t border-surface-border pt-3">
        <p className="text-sm font-semibold text-stone-200">プロフィール(会員証に表示)</p>
        <div className="mt-2 space-y-2">
          <div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              rows={2}
              maxLength={BIO_MAX}
              placeholder="一言バイオ(任意)"
              className="form-input !py-1.5 text-xs"
            />
            <p className="mt-0.5 text-right text-[10px] text-stone-500">
              {bio.length} / {BIO_MAX}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={link1.label}
              onChange={(e) => setLink1((prev) => ({ ...prev, label: e.target.value }))}
              maxLength={30}
              placeholder="リンク名(例: X)"
              className="form-input w-28 shrink-0 !py-1.5 text-xs"
            />
            <input
              value={link1.url}
              onChange={(e) => setLink1((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
              className="form-input min-w-0 flex-1 !py-1.5 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={link2.label}
              onChange={(e) => setLink2((prev) => ({ ...prev, label: e.target.value }))}
              maxLength={30}
              placeholder="リンク名(例: ブログ)"
              className="form-input w-28 shrink-0 !py-1.5 text-xs"
            />
            <input
              value={link2.url}
              onChange={(e) => setLink2((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
              className="form-input min-w-0 flex-1 !py-1.5 text-xs"
            />
          </div>
          {profileError && <p className="text-xs text-gold-light">{profileError}</p>}
          <button onClick={saveProfile} disabled={profileSaving} className="ghost-button w-full !py-1.5 text-xs">
            {profileSaving ? "保存中…" : profileSaved ? "保存しました" : "プロフィールを保存"}
          </button>
        </div>
      </div>
    </section>
  );
}
