import { Icon, type IconName } from "@/components/Icon";

type Props = {
  name: string;
  avatarIcon: IconName;
  level: number;
  title: string;
  memberSince: Date;
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium" }).format(d);
}

/** 会員証。/home(本人・非公開含む)と /card/[id](公開時のみ第三者に表示)の両方から使う */
export function MemberCard({ name, avatarIcon, level, title, memberSince }: Props) {
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
      <p className="mt-4 border-t border-surface-border pt-3 text-right text-[10px] text-stone-500">
        入館日: {formatDate(memberSince)}
      </p>
    </section>
  );
}
