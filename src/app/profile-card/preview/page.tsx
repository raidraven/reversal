"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MemberCard } from "@/components/home/MemberCard";
import { Icon, type IconName } from "@/components/Icon";
import { PREVIEW_STORAGE_KEY, type DemoPreviewPayload } from "@/components/profileCard/previewPayload";

export default function ProfileCardPreviewPage() {
  const [payload, setPayload] = useState<DemoPreviewPayload | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(PREVIEW_STORAGE_KEY);
      setPayload(raw ? (JSON.parse(raw) as DemoPreviewPayload) : null);
    } catch {
      setPayload(null);
    }
  }, []);

  if (payload === undefined) return null;

  if (!payload) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12 text-center">
        <div className="game-card space-y-3">
          <p className="flex justify-center">
            <Icon name="lock" size={28} />
          </p>
          <h1 className="mansion-title text-xl">プレビューが見つかりません</h1>
          <p className="text-sm text-stone-400">
            プロフカード作成ページから「個別ページでプレビュー」を押してお試しください。
          </p>
          <Link href="/profile-card" className="neon-button block text-center">
            プロフカードを作るに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {payload.wallpaperUrl && (
        <div
          className="fixed inset-0 -z-10"
          style={{ backgroundImage: `url(${payload.wallpaperUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-12">
        <p className="mb-4 text-center text-xs text-gold-light">
          体験版のプレビューです。内容は保存されていません
        </p>

        <MemberCard
          name={payload.name}
          avatarIcon={payload.avatarIcon as IconName}
          level={1}
          title={payload.title}
          memberSinceLabel="体験中"
          bio={payload.bio}
          links={payload.links}
          cardIconUrl={payload.iconUrl}
          cardBgUrl={payload.bgUrl}
          headerText={payload.headerText}
          nameSuffixText={payload.nameSuffixText}
          titleText={payload.titleText}
          levelLabelText={payload.levelLabelText}
          memberSinceLabelText={payload.memberSinceLabelText}
          scale={payload.scale}
        />

        <div className="mt-6 text-center">
          <Link href="/signup" className="neon-button inline-block !px-6 text-sm">
            無料登録
          </Link>
          <p className="mt-3 text-xs text-stone-500">
            <Link href="/profile-card" className="text-gold-light hover:underline">
              編集に戻る
            </Link>
            {" ・ "}
            <Link href="/" className="text-gold-light hover:underline">
              館の入口へ戻る
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
