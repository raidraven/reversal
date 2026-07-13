"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border border-surface-border px-3 py-1.5 text-xs text-stone-400 transition-colors hover:border-gold/40 hover:text-stone-200"
    >
      洋館を出る
    </button>
  );
}
