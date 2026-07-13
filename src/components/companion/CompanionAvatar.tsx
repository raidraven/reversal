"use client";

import { useEffect, useState } from "react";
import { emotionImagePath, type CompanionEmotion } from "@/lib/companionEmotion";
import { isImageIconValue } from "@/lib/siteIcon";

type Props = {
  emotion: CompanionEmotion;
  /** 画像が用意されていない場合に表示する絵文字 */
  fallbackEmoji: string;
  /** Tailwindのサイズクラス(例: "h-10 w-10") */
  sizeClass: string;
  className?: string;
};

// 一度読み込みに失敗した表情画像を記録し、以後は絵文字で描画する(毎回のリクエスト失敗を防ぐ)
const failedImages = new Set<string>();

/** クロエの表情アバター。public/companion/{emotion}.png が無ければ絵文字にフォールバック */
export function CompanionAvatar({ emotion, fallbackEmoji, sizeClass, className = "" }: Props) {
  const src = emotionImagePath(emotion);
  const [failed, setFailed] = useState(failedImages.has(src));

  useEffect(() => {
    setFailed(failedImages.has(src));
  }, [src]);

  if (failed) {
    if (isImageIconValue(fallbackEmoji)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackEmoji}
          alt="アイコン"
          className={`shrink-0 rounded-full border border-gold/40 bg-surface-raised object-cover ${sizeClass} ${className}`}
        />
      );
    }
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-wine-light to-gold text-xl ${sizeClass} ${className}`}
      >
        {fallbackEmoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`クロエ(${emotion})`}
      onError={() => {
        failedImages.add(src);
        setFailed(true);
      }}
      className={`shrink-0 rounded-full border border-gold/40 bg-surface-raised object-cover ${sizeClass} ${className}`}
    />
  );
}
