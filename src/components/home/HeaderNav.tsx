import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import type { NavLink } from "@/components/MobileNavMenu";

type Props = {
  links: NavLink[];
};

const DESKTOP_LINK_CLASS =
  "rounded-md border border-surface-border px-3 py-1.5 text-xs text-stone-400 transition-colors hover:border-gold/40 hover:text-stone-200";
const DESKTOP_LINK_GOLD_CLASS =
  "rounded-md border border-gold/40 px-3 py-1.5 text-xs text-gold-light transition-colors hover:bg-gold/10";

/** ホーム画面ヘッダーのデスクトップ用ナビ(横並び)。モバイルの右スライドメニューは MobileNavMenu(全ページ共通・layout.tsx) が担当 */
export function HeaderNav({ links }: Props) {
  return (
    <nav className="hidden items-center gap-2 lg:flex">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={l.gold ? DESKTOP_LINK_GOLD_CLASS : DESKTOP_LINK_CLASS}>
          {l.label}
        </Link>
      ))}
      <LogoutButton />
    </nav>
  );
}
