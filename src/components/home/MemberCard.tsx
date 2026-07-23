import { Icon, type IconName } from "@/components/Icon";

export type CardLink = { label: string; url: string };

type Props = {
  name: string;
  avatarIcon: IconName;
  level: number;
  title: string;
  /** 入館日。省略時は memberSinceLabel を使う(体験版プレビュー等、実在の日付がない場合) */
  memberSince?: Date;
  memberSinceLabel?: string;
  bio?: string | null;
  links?: CardLink[];
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium" }).format(d);
}

/** httpまたはhttps以外のURL(javascript:等)を弾く。安全なリンクのみ描画するため */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** 会員証。/home(本人・非公開含む)・/card/[id](公開時のみ第三者に表示)・/profile-card(未登録の体験版)から使う */
export function MemberCard({ name, avatarIcon, level, title, memberSince, memberSinceLabel, bio, links }: Props) {
  const safeLinks = (links ?? []).filter((l) => l.label.trim() && isSafeUrl(l.url));

  return (
    <section className="game-card relative overflow-hidden border-gold/40">
      <div className="pointer-events-none absolute -right-6 -top-6 opacity-10">
        <Icon name="candle" size={120} />
      </div>
      <p className="text-center text-[10px] uppercase tracking-[0.3em] text-gold/70">
        REVERSAL 会員証
      </p>
      <div className="mt-3 flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-surface-raised shadow-gold">
          <Icon name={avatarIcon} size={36} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-serif text-xl font-bold text-stone-100">{name} 様</p>
          <p className="mt-0.5 inline-block rounded-full border border-wine-light/50 bg-wine/20 px-2 py-0.5 text-xs text-gold-light">
            {title}
          </p>
        </div>
        <span className="ml-auto text-right">
          <span className="block text-xs text-stone-500">位階</span>
          <span className="block text-3xl font-black text-gold-light drop-shadow-[0_0_8px_rgba(201,162,77,0.4)]">
            {level}
          </span>
        </span>
      </div>

      {bio && <p className="mt-3 whitespace-pre-wrap text-sm text-stone-300">{bio}</p>}

      {safeLinks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {safeLinks.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-light hover:bg-gold/10"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

      <p className="mt-4 border-t border-surface-border pt-3 text-right text-[10px] text-stone-500">
        入館日: {memberSince ? formatDate(memberSince) : memberSinceLabel}
      </p>
    </section>
  );
}
