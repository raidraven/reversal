"use client";

import { useState } from "react";
import Link from "next/link";
import { AVATARS, type AvatarId } from "@/lib/onboarding";
import { MemberCard } from "@/components/home/MemberCard";
import { Icon } from "@/components/Icon";
import { ImagePickerField } from "./ImagePickerField";
import { LinksEditor, type LinkField } from "./LinksEditor";
import { TextOverrideField, textOverrideToPayload, type TextOverrideState } from "./TextOverrideField";

const BIO_MAX = 150;
const EMPTY_OVERRIDE: TextOverrideState = { text: "", hidden: false };

/** 未登録ユーザー向けの体験版プロフカード作成ツール。DBには何も保存せず、画像もローカルプレビューのみ(アップロードしない) */
export function ProfileCardMaker() {
  const [name, setName] = useState("名も無き来賓");
  const [avatarId, setAvatarId] = useState<AvatarId>(AVATARS[0].id);
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState<LinkField[]>([{ label: "X", url: "" }]);
  const [scale, setScale] = useState(100);

  const [header, setHeader] = useState<TextOverrideState>(EMPTY_OVERRIDE);
  const [nameSuffix, setNameSuffix] = useState<TextOverrideState>(EMPTY_OVERRIDE);
  const [levelLabel, setLevelLabel] = useState<TextOverrideState>(EMPTY_OVERRIDE);
  const [sinceLabel, setSinceLabel] = useState<TextOverrideState>(EMPTY_OVERRIDE);

  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  const avatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];

  function pickLocalPreview(setter: (url: string) => void) {
    return (file: File) => setter(URL.createObjectURL(file));
  }

  return (
    <div className="space-y-4" style={wallpaperUrl ? { backgroundImage: `url(${wallpaperUrl})`, backgroundSize: "cover" } : undefined}>
      <section className="game-card space-y-3">
        <div>
          <label className="text-xs text-stone-400">表示名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            maxLength={20}
            className="form-input mt-1 !py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-stone-400">仮面(アバター)</label>
          <div className="mt-1 flex gap-2">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAvatarId(a.id)}
                aria-label={a.label}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                  a.id === avatarId
                    ? "border-gold bg-gold/10 shadow-gold"
                    : "border-surface-border bg-surface-raised hover:border-gold/40"
                }`}
              >
                <Icon name={a.icon} size={20} />
              </button>
            ))}
          </div>
        </div>

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
            placeholder="例: AI副業に挑戦中。収益0円から実況しています"
            className="form-input mt-1 !py-1.5 text-xs"
          />
        </div>

        <LinksEditor links={links} onChange={setLinks} />
      </section>

      <section className="game-card space-y-3">
        <p className="text-sm font-semibold text-stone-200">画像(プレビューのみ・保存されません)</p>
        <ImagePickerField
          label="ページの壁紙"
          previewUrl={wallpaperUrl}
          onSelect={pickLocalPreview(setWallpaperUrl)}
          onRemove={() => setWallpaperUrl(null)}
        />
        <ImagePickerField
          label="アイコン画像"
          previewUrl={iconUrl}
          onSelect={pickLocalPreview(setIconUrl)}
          onRemove={() => setIconUrl(null)}
        />
        <ImagePickerField
          label="会員証の背景"
          previewUrl={bgUrl}
          onSelect={pickLocalPreview(setBgUrl)}
          onRemove={() => setBgUrl(null)}
        />
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

      <p className="text-center text-xs text-stone-500">プレビュー</p>

      <MemberCard
        name={name || "名も無き来賓"}
        avatarIcon={avatar.icon}
        level={1}
        title="扉を開いた者"
        memberSinceLabel="体験中"
        bio={bio}
        links={links.filter((l) => l.label.trim() && l.url.trim())}
        cardIconUrl={iconUrl}
        cardBgUrl={bgUrl}
        headerText={textOverrideToPayload(header) ?? undefined}
        nameSuffixText={textOverrideToPayload(nameSuffix) ?? undefined}
        levelLabelText={textOverrideToPayload(levelLabel) ?? undefined}
        memberSinceLabelText={textOverrideToPayload(sinceLabel) ?? undefined}
        scale={scale}
      />

      <div className="game-card animate-fade-up space-y-3 border-gold/60 text-center">
        <p className="flex justify-center">
          <Icon name="candle" size={28} />
        </p>
        <p className="mansion-title text-base">このカードは体験版です</p>
        <p className="text-sm text-stone-300">
          ここでの内容(画像を含む)は保存されません。実際に会員証として公開し、紹介リンクを発行するには入館が必要です。
        </p>
        <Link href="/signup" className="neon-button block text-center">
          招待状を受け取る
        </Link>
      </div>
    </div>
  );
}
