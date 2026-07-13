import { isImageIconValue } from "@/lib/siteIcon";

type Props = {
  value: string;
  /** 表示サイズ(px)。画像・絵文字ともにこのサイズで揃える。既定は32px */
  size?: number;
  alt?: string;
  className?: string;
};

/** サイト文言の「アイコン」欄を表示する。値が画像URLなら<img>、そうでなければ絵文字として表示する */
export function SiteIcon({ value, size = 32, alt = "", className = "" }: Props) {
  if (isImageIconValue(value)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt={alt}
        width={size}
        height={size}
        className={`inline-block shrink-0 rounded-full border border-gold/30 object-cover align-middle ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center align-middle leading-none ${className}`}
      style={{ fontSize: size * 0.8, width: size, height: size }}
    >
      {value}
    </span>
  );
}
