"use client";

import { signOut } from "next-auth/react";

type Props = {
  className?: string;
};

const DEFAULT_CLASS =
  "rounded-md border border-surface-border px-3 py-1.5 text-xs text-stone-400 transition-colors hover:border-gold/40 hover:text-stone-200";

export function LogoutButton({ className = DEFAULT_CLASS }: Props) {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className={className}>
      ログアウト
    </button>
  );
}
