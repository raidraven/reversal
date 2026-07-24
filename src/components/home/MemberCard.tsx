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

  /** アップロード画像(未設定時は avatarIcon / 単色背景を使う) */
  cardIconUrl?: string | null;
  cardBgUrl?: string | null;

  /** 文言上書き。undefined=デフォルト文言 / ""=非表示 / それ以外=その文言を表示 */
  headerText?: string | null;
  nameSuffixText?: string | null;
  levelLabelText?: string | null;
  memberSinceLabelText?: string | null;

  /** 表示倍率(%)。省略時100 */
  scale?: number;
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

/** undefined/null=デフォルト文言(DBの未設定値は常にnullで来る) / ""=非表示 / それ以外=上書き文言、を解決する */
function resolveText(override: string | null | undefined, fallback: string): string | null {
  if (override === undefined || override === null) return fallback;
  if (override === "") return null;
  return override;
}

/** 会員証。/home(本人・非公開含む)・/card/[id](公開時のみ第三者に表示)・/profile-card(未登録の体験版)から使う */
export function MemberCard({
  name,
  avatarIcon,
  level,
  title,
  memberSince,
  memberSinceLabel,
  bio,
  links,
  cardIconUrl,
  cardBgUrl,
  headerText,
  nameSuffixText,
  levelLabelText,
  memberSinceLabelText,
  scale = 100,
}: Props) {
  const safeLinks = (links ?? []).filter((l) => l.label.trim() && isSafeUrl(l.url)).slice(0, 10);

  const header = resolveText(headerText, "REVERSAL 会員証");
  const nameSuffix = resolveText(nameSuffixText, "様");
  const levelLabel = resolveText(levelLabelText, "位階");
  const sinceLabel = resolveText(memberSinceLabelText, "入館日");
  const sinceValue = memberSince ? formatDate(memberSince) : memberSinceLabel;

  return (
    <div style={{ zoom: scale !== 100 ? `${scale}%` : undefined }}>
      <section className="game-card relative overflow-hidden border-gold/40">
        {cardBgUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cardBgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-surface-card/80" />
          </>
        )}
        {!cardBgUrl && (
          <div className="pointer-events-none absolute -right-6 -top-6 opacity-10">
            <Icon name="candle" size={120} />
          </div>
        )}

        <div className="relative">
          {header && (
            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-gold/70">{header}</p>
          )}
          <div className="mt-3 flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/40 bg-surface-raised shadow-gold">
              {cardIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cardIconUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Icon name={avatarIcon} size={36} />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-serif text-xl font-bold text-stone-100">
                {name}
                {nameSuffix ? ` ${nameSuffix}` : ""}
              </p>
              <p className="mt-0.5 inline-block rounded-full border border-wine-light/50 bg-wine/20 px-2 py-0.5 text-xs text-gold-light">
                {title}
              </p>
            </div>
            {levelLabel && (
              <span className="ml-auto text-right">
                <span className="block text-xs text-stone-500">{levelLabel}</span>
                <span className="block text-3xl font-black text-gold-light drop-shadow-[0_0_8px_rgba(201,162,77,0.4)]">
                  {level}
                </span>
              </span>
            )}
          </div>

          {bio && <p className="mt-3 whitespace-pre-wrap text-sm text-stone-300">{bio}</p>}

          {safeLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {safeLinks.map((l, i) => (
                <a
                  key={`${l.url}-${i}`}
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

          {sinceLabel && sinceValue && (
            <p className="mt-4 border-t border-surface-border pt-3 text-right text-[10px] text-stone-500">
              {sinceLabel}: {sinceValue}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
