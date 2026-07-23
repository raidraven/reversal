"use client";

import { useState } from "react";
import Link from "next/link";
import { AVATARS, type AvatarId } from "@/lib/onboarding";
import { MemberCard } from "@/components/home/MemberCard";
import { Icon } from "@/components/Icon";

const BIO_MAX = 150;

/** 未登録ユーザー向けの体験版プロフカード作成ツール。DBには何も保存しない(保存はサインアップ後、自室ページから) */
export function ProfileCardMaker() {
  const [name, setName] = useState("名も無き来賓");
  const [avatarId, setAvatarId] = useState<AvatarId>(AVATARS[0].id);
  const [bio, setBio] = useState("");
  const [linkLabel, setLinkLabel] = useState("X");
  const [linkUrl, setLinkUrl] = useState("");

  const avatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0];

  return (
    <div className="space-y-4">
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

        <div>
          <label className="text-xs text-stone-400">外部リンク(任意)</label>
          <div className="mt-1 flex gap-2">
            <input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value.slice(0, 30))}
              maxLength={30}
              placeholder="リンク名"
              className="form-input w-24 shrink-0 !py-1.5 text-xs"
            />
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="form-input min-w-0 flex-1 !py-1.5 text-xs"
            />
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-stone-500">プレビュー</p>

      <MemberCard
        name={name || "名も無き来賓"}
        avatarIcon={avatar.icon}
        level={1}
        title="扉を開いた者"
        memberSinceLabel="体験中"
        bio={bio}
        links={linkUrl ? [{ label: linkLabel || "リンク", url: linkUrl }] : []}
      />

      <div className="game-card animate-fade-up space-y-3 border-gold/60 text-center">
        <p className="flex justify-center">
          <Icon name="candle" size={28} />
        </p>
        <p className="mansion-title text-base">このカードは体験版です</p>
        <p className="text-sm text-stone-300">
          ここでの内容は保存されません。実際に会員証として公開し、紹介リンクを発行するには入館が必要です。
        </p>
        <Link href="/signup" className="neon-button block text-center">
          招待状を受け取る
        </Link>
      </div>
    </div>
  );
}
