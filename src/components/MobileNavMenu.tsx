"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export type NavLink = {
  href: string;
  label: string;
  /** 強調表示(主人の部屋等) */
  gold?: boolean;
  /** 未読件数バッジ(0または未指定なら非表示) */
  badge?: number;
};

type Props = {
  links: NavLink[];
};

const DRAWER_LINK_CLASS =
  "rounded-md border border-surface-border px-3 py-2.5 text-sm text-stone-300 transition-colors hover:border-gold/40 hover:text-stone-100";
const DRAWER_LINK_GOLD_CLASS =
  "rounded-md border border-gold/40 px-3 py-2.5 text-sm text-gold-light transition-colors hover:bg-gold/10";

/** 全ページ共通のモバイル用サイドメニュー(ハンバーガー→右スライド)。スクロールしても常に表示される */
export function MobileNavMenu({ links }: Props) {
  const [open, setOpen] = useState(false);
  const totalBadge = links.reduce((sum, l) => sum + (l.badge ?? 0), 0);

  return (
    <>
      {/* ハンバーガーボタン(スクロールしても常に表示) */}
      <button
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
        className="fixed right-4 top-4 z-40 flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-md border border-surface-border bg-surface-card/90 shadow-lg backdrop-blur transition-colors hover:border-gold/40 lg:hidden"
      >
        <span className="h-0.5 w-5 rounded-full bg-gold-light" />
        <span className="h-0.5 w-5 rounded-full bg-gold-light" />
        <span className="h-0.5 w-5 rounded-full bg-gold-light" />
        {totalBadge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-wine-light text-[9px] font-bold text-stone-100">
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        )}
      </button>

      {/* 右スライドメニュー */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-up bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-64 max-w-[80vw] animate-slide-in-right flex-col gap-2 border-l border-surface-border bg-surface-card p-4 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="メニューを閉じる"
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-lg text-stone-400 transition-colors hover:text-stone-200"
            >
              ✕
            </button>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between ${l.gold ? DRAWER_LINK_GOLD_CLASS : DRAWER_LINK_CLASS}`}
              >
                {l.label}
                {!!l.badge && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-wine-light px-1 text-[10px] font-bold text-stone-100">
                    {l.badge > 9 ? "9+" : l.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="mt-1 flex flex-col gap-2">
              <LogoutButton className={DRAWER_LINK_CLASS + " w-full text-left"} />
              <Link
                href="/withdraw"
                onClick={() => setOpen(false)}
                className={DRAWER_LINK_CLASS + " text-center text-stone-500"}
              >
                退会する
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
