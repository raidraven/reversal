import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { Icon } from "@/components/Icon";
import type { NavLink } from "@/components/MobileNavMenu";

type Props = {
  links: NavLink[];
  isLoggedIn: boolean;
};

const LINK_CLASS =
  "rounded-md border border-surface-border px-3 py-2 text-xs text-stone-400 transition-colors hover:border-gold/40 hover:text-stone-200";
const LINK_GOLD_CLASS =
  "rounded-md border border-gold/40 px-3 py-2 text-xs text-gold-light transition-colors hover:bg-gold/10";

/** PCデスクトップ用の左端固定ナビ(縦並び・全ページ共通)。モバイルの右スライドメニューは MobileNavMenu が担当 */
export function DesktopNav({ links, isLoggedIn }: Props) {
  return (
    <nav className="fixed left-0 top-0 z-30 hidden h-full w-48 flex-col gap-2 overflow-y-auto border-r border-surface-border bg-surface-card/90 p-4 backdrop-blur lg:flex">
      <Link href="/" className="mb-2 flex items-center gap-2 text-sm text-stone-300 hover:text-gold-light">
        <Icon name="candle" size={20} />
        <span className="mansion-title text-sm">リバーサル</span>
      </Link>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center justify-between ${l.gold ? LINK_GOLD_CLASS : LINK_CLASS}`}
        >
          {l.label}
          {!!l.badge && (
            <span className="ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-wine-light px-1 text-[9px] font-bold text-stone-100">
              {l.badge > 9 ? "9+" : l.badge}
            </span>
          )}
        </Link>
      ))}
      {isLoggedIn && (
        <div className="mt-auto">
          <LogoutButton className={LINK_CLASS + " w-full text-left"} />
        </div>
      )}
    </nav>
  );
}
