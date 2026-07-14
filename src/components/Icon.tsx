import Image from "next/image";

// 絵文字名 → Gemini生成アイコン画像のマッピング
// 画像本体は public/icons/ 配下(scripts/generate-icon.mjs で生成)
const ICON_MAP = {
  bat: "/icons/bat.png",
  bulb: "/icons/bulb.png",
  candle: "/icons/candle.png",
  check: "/icons/check.png",
  coin: "/icons/coin.png",
  crow: "/icons/crow.png",
  door: "/icons/door.png",
  flag: "/icons/flag.png",
  "heart-filled": "/icons/heart-filled.png",
  "heart-outline": "/icons/heart-outline.png",
  key: "/icons/key.png",
  "key-ornate": "/icons/key-ornate.png",
  lock: "/icons/lock.png",
  mask: "/icons/mask.png",
  megaphone: "/icons/megaphone.png",
  memo: "/icons/memo.png",
  owl: "/icons/owl.png",
  pencil: "/icons/pencil.png",
  question: "/icons/question.png",
  quill: "/icons/quill.png",
  rose: "/icons/rose.png",
  scroll: "/icons/scroll.png",
  stopwatch: "/icons/stopwatch.png",
  talk: "/icons/talk.png",
  tools: "/icons/tools.png",
  trophy: "/icons/trophy.png",
  warning: "/icons/warning.png",
} as const;

export type IconName = keyof typeof ICON_MAP;

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

/** サイト内の装飾アイコン(旧・絵文字)を表示する。中身は public/icons/ の生成画像 */
export function Icon({ name, size = 20, className }: Props) {
  return (
    <Image
      src={ICON_MAP[name]}
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", objectFit: "contain" }}
    />
  );
}
