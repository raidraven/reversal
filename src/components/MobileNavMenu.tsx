"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export type NavLink = {
  href: string;
  label: string;
  /** 強調表示(主人の部屋等) */
  gold?: boolean;
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
                className={l.gold ? DRAWER_LINK_GOLD_CLASS : DRAWER_LINK_CLASS}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-1">
              <LogoutButton className={DRAWER_LINK_CLASS + " w-full text-left"} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
