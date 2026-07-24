"use client";

import { useState } from "react";
import type { IconName } from "@/components/Icon";
import { MemberCard } from "@/components/home/MemberCard";
import { ImagePickerField } from "./ImagePickerField";
import { LinksEditor, type LinkField } from "./LinksEditor";
import { TextOverrideField, textOverrideToPayload, type TextOverrideState } from "./TextOverrideField";

type Props = {
  userId: string;
  siteUrl: string;
  name: string;
  avatarIcon: IconName;
  level: number;
  title: string;
  memberSince: string; // ISO
  initialCardPublic: boolean;
  referralCount: number;
  initialBio: string;
  initialLinks: LinkField[];
  initialCardWallpaperUrl: string | null;
  initialCardIconUrl: string | null;
  initialCardBgUrl: string | null;
  initialCardHeaderText: string | null;
  initialCardNameSuffixText: string | null;
  initialCardLevelLabelText: string | null;
  initialCardMemberSinceLabelText: string | null;
  initialCardScale: number;
};

const BIO_MAX = 150;

function toOverrideState(v: string | null): TextOverrideState {
  if (v === null) return { text: "", hidden: false };
  if (v === "") return { text: "", hidden: true };
  return { text: v, hidden: false };
}

type UploadField = "wallpaper" | "icon" | "background";

export function ProfileCardEditor({
  userId,
  siteUrl,
  name,
  avatarIcon,
  level,
  title,
  memberSince,
  initialCardPublic,
  referralCount,
  initialBio,
  initialLinks,
  initialCardWallpaperUrl,
  initialCardIconUrl,
  initialCardBgUrl,
  initialCardHeaderText,
  initialCardNameSuffixText,
  initialCardLevelLabelText,
  initialCardMemberSinceLabelText,
  initialCardScale,
}: Props) {
  const [cardPublic, setCardPublic] = useState(initialCardPublic);
  const [visSaving, setVisSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [bio, setBio] = useState(initialBio);
  const [links, setLinks] = useState<LinkField[]>(initialLinks);
  const [scale, setScale] = useState(initialCardScale);

  const [header, setHeader] = useState<TextOverrideState>(toOverrideState(initialCardHeaderText));
  const [nameSuffix, setNameSuffix] = useState<TextOverrideState>(toOverrideState(initialCardNameSuffixText));
  const [levelLabel, setLevelLabel] = useState<TextOverrideState>(toOverrideState(initialCardLevelLabelText));
  const [sinceLabel, setSinceLabel] = useState<TextOverrideState>(
    toOverrideState(initialCardMemberSinceLabelText)
  );

  const [wallpaperUrl, setWallpaperUrl] = useState(initialCardWallpaperUrl);
  const [iconUrl, setIconUrl] = useState(initialCardIconUrl);
  const [bgUrl, setBgUrl] = useState(initialCardBgUrl);
  const [uploading, setUploading] = useState<UploadField | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referralLink = `${siteUrl}/signup?ref=${userId}`;
  const cardLink = `${siteUrl}/card/${userId}`;

  async function handleVisibilityChange(next: boolean) {
    setCardPublic(next);
    setVisSaving(true);
    try {
      await fetch("/api/account/card-visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardPublic: next }),
      });
    } finally {
      setVisSaving(false);
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

  async function uploadImage(field: UploadField, file: File) {
    setUploading(field);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("field", field);
      const res = await fetch("/api/account/profile-card/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "アップロードに失敗しました");
        return;
      }
      if (field === "wallpaper") setWallpaperUrl(data.url);
      if (field === "icon") setIconUrl(data.url);
      if (field === "background") setBgUrl(data.url);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setUploading(null);
    }
  }

  async function removeImage(field: UploadField) {
    setUploading(field);
    setError(null);
    try {
      await fetch("/api/account/profile-card/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });
      if (field === "wallpaper") setWallpaperUrl(null);
      if (field === "icon") setIconUrl(null);
      if (field === "background") setBgUrl(null);
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/account/profile-card", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          links: links.filter((l) => l.label.trim() && l.url.trim()),
          cardHeaderText: textOverrideToPayload(header),
          cardNameSuffixText: textOverrideToPayload(nameSuffix),
          cardLevelLabelText: textOverrideToPayload(levelLabel),
          cardMemberSinceLabelText: textOverrideToPayload(sinceLabel),
          cardScale: scale,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "保存に失敗しました");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="game-card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-200">会員証の公開設定</p>
          <select
            value={cardPublic ? "public" : "private"}
            onChange={(e) => handleVisibilityChange(e.target.value === "public")}
            disabled={visSaving}
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

      <section className="game-card space-y-3">
        <p className="text-sm font-semibold text-stone-200">画像</p>
        <ImagePickerField
          label="ページの壁紙"
          hint="プロフカードページ・公開カードページの背景"
          previewUrl={wallpaperUrl}
          busy={uploading === "wallpaper"}
          onSelect={(f) => uploadImage("wallpaper", f)}
          onRemove={() => removeImage("wallpaper")}
        />
        <ImagePickerField
          label="アイコン画像"
          hint="未設定時は仮面アイコン"
          previewUrl={iconUrl}
          busy={uploading === "icon"}
          onSelect={(f) => uploadImage("icon", f)}
          onRemove={() => removeImage("icon")}
        />
        <ImagePickerField
          label="会員証の背景"
          hint="カード自体の背景画像"
          previewUrl={bgUrl}
          busy={uploading === "background"}
          onSelect={(f) => uploadImage("background", f)}
          onRemove={() => removeImage("background")}
        />
      </section>

      <section className="game-card space-y-3">
        <p className="text-sm font-semibold text-stone-200">プロフィール</p>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-stone-400">一言バイオ</label>
            <span className="text-[10px] text-stone-500">
              {bio.length} / {BIO_MAX}
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            rows={2}
            maxLength={BIO_MAX}
            placeholder="一言バイオ(任意)"
            className="form-input mt-1 !py-1.5 text-xs"
          />
        </div>
        <LinksEditor links={links} onChange={setLinks} />
      </section>

      <section className="game-card space-y-3">
        <p className="text-sm font-semibold text-stone-200">会員証の文言</p>
        <TextOverrideField label="見出し" defaultText="REVERSAL 会員証" value={header} onChange={setHeader} />
        <TextOverrideField label="名前の後の敬称" defaultText="様" value={nameSuffix} onChange={setNameSuffix} />
        <TextOverrideField label="位階ラベル" defaultText="位階" value={levelLabel} onChange={setLevelLabel} />
        <TextOverrideField
          label="入館日ラベル"
          defaultText="入館日"
          value={sinceLabel}
          onChange={setSinceLabel}
        />
      </section>

      <section className="game-card space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-stone-400">会員証の大きさ</label>
          <span className="text-[10px] text-stone-500">{scale}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={200}
          step={10}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="w-full"
        />
      </section>

      {error && (
        <p className="rounded-lg border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}
      <button onClick={save} disabled={saving} className="neon-button w-full">
        {saving ? "保存中…" : saved ? "保存しました" : "プロフカードを保存"}
      </button>

      <p className="text-center text-xs text-stone-500">プレビュー</p>
      <MemberCard
        name={name}
        avatarIcon={avatarIcon}
        level={level}
        title={title}
        memberSince={new Date(memberSince)}
        bio={bio}
        links={links.filter((l) => l.label.trim() && l.url.trim())}
        cardIconUrl={iconUrl}
        cardBgUrl={bgUrl}
        headerText={header.hidden ? "" : header.text.trim() || undefined}
        nameSuffixText={nameSuffix.hidden ? "" : nameSuffix.text.trim() || undefined}
        levelLabelText={levelLabel.hidden ? "" : levelLabel.text.trim() || undefined}
        memberSinceLabelText={sinceLabel.hidden ? "" : sinceLabel.text.trim() || undefined}
        scale={scale}
      />
    </div>
  );
}
