// Gemini画像生成用のアイコン定義(絵文字 → プロンプト・出力ファイル名)
// 個別に再生成したい場合は generate-icon.mjs に対象キーを指定して実行する

const STYLE_BASE =
  "A single minimalist gold line-art icon, nothing else in the image. " +
  "Flat solid pure black background (#000000) — completely empty and plain, no scenery, no landscape, " +
  "no silhouettes, no additional objects, no decorative elements besides the one icon subject itself. " +
  "The icon itself: thin, refined, single-weight gold outline strokes (warm antique gold, like #D4AF37), " +
  "simple and iconic, outline only — no fill, no shading, no gradient, no drop shadow, not ornate or detailed, " +
  "in an elegant gothic-mansion / masquerade visual style. " +
  "Square 1:1 canvas. Draw the subject small enough that its entire silhouette — including small " +
  "extending details like flame tips, thorns, or wing tips — fits well inside the frame with plainly " +
  "visible empty black margin on all four sides. Nothing may touch or be cropped by the image edges. " +
  "No text, no watermark, no border, no frame, no other shapes.";

export const ICONS = {
  candle: { emoji: "🕯️", subject: "a lit candle with a small flame, wax dripping slightly, gothic candlestick base" },
  question: { emoji: "❓", subject: "an elegant serif-style question mark" },
  mask: { emoji: "🎭", subject: "a single elegant Venetian masquerade mask" },
  talk: { emoji: "🗣️", subject: "a speech bubble representing conversation" },
  "key-ornate": { emoji: "🗝️", subject: "an ornate antique Victorian skeleton key" },
  scroll: { emoji: "📜", subject: "a rolled parchment scroll, both ends curled" },
  crow: { emoji: "🐦‍⬛", subject: "a stylized crow or raven, perched, wings folded" },
  door: {
    emoji: "🚪",
    subject:
      "an ornate arched mansion door, drawn strictly as an outline only — every part of the door " +
      "(panels, arch, frame) must be open/hollow line strokes, absolutely no solid black or filled " +
      "silhouette areas anywhere in the icon",
  },
  lock: { emoji: "🔒", subject: "a closed padlock" },
  quill: { emoji: "🖋️", subject: "an antique quill / fountain pen" },
  key: { emoji: "🔑", subject: "a simple modern key" },
  trophy: { emoji: "🏆", subject: "a classic trophy cup" },
  bulb: { emoji: "💡", subject: "a lightbulb" },
  memo: { emoji: "📝", subject: "a pencil writing on a small note/paper" },
  stopwatch: { emoji: "⏱️", subject: "a stopwatch" },
  megaphone: { emoji: "📣", subject: "a megaphone" },
  owl: { emoji: "🦉", subject: "a stylized owl, perched, front-facing" },
  rose: { emoji: "🌹", subject: "a single rose with stem and thorns" },
  bat: { emoji: "🦇", subject: "a bat with wings spread" },
  tools: { emoji: "🛠️", subject: "a crossed wrench and screwdriver" },
  flag: { emoji: "🚩", subject: "a small triangular flag on a short pole" },
  warning: { emoji: "⚠️", subject: "a warning triangle with an exclamation mark inside" },
  check: { emoji: "✅", subject: "a checkmark inside a circle" },
  coin: { emoji: "💰", subject: "a stack of two coins with a simple currency mark engraved on the top coin" },
  pencil: { emoji: "✏️", subject: "a pencil, tip pointing down-left, as if writing" },
  "heart-filled": {
    emoji: "❤️",
    subject: "a heart shape",
    // 「輪郭線のみ・塗りつぶし禁止」という基本スタイルを、このアイコンだけ明示的に上書きする
    styleException:
      "Exception to the style rules above: for this icon, ignore the 'outline only, no fill' " +
      "instruction — the heart must be a solid, fully filled, flat gold silhouette shape with no " +
      "visible interior black background, so it reads as clearly 'filled/liked' at a glance.",
  },
  "heart-outline": { emoji: "🤍", subject: "a heart shape, outline only, not filled, thin gold stroke" },
};

export function buildPrompt(key) {
  const icon = ICONS[key];
  if (!icon) throw new Error(`Unknown icon key: ${key}`);
  const exception = icon.styleException ? ` ${icon.styleException}` : "";
  return `${STYLE_BASE} Subject: ${icon.subject}.${exception}`;
}
