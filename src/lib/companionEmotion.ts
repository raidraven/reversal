// コンパニオンの表情(感情タグ)の共有定義
// クライアント/サーバー両方から使える純粋な関数のみ(Prisma等のI/Oを一切importしないこと)
//
// クロエの返答は先頭に《emotion》タグを付けて生成される。
// UI側はタグを解析して表示から取り除き、対応する表情画像に切り替える。

export const COMPANION_EMOTIONS = [
  "calm",
  "smile",
  "fearless",
  "surprised",
  "serious",
  "confused",
  "angry",
  "sorrow",
  "pondering",
  "disgust",
] as const;
export type CompanionEmotion = (typeof COMPANION_EMOTIONS)[number];

export const DEFAULT_EMOTION: CompanionEmotion = "calm";

/** 表情画像のパス(public/companion/ 配下に配置する) */
export function emotionImagePath(emotion: CompanionEmotion): string {
  return `/companion/${emotion}.png`;
}

/** システムプロンプトに追記する、感情タグの出力指示 */
export const EMOTION_TAG_INSTRUCTION = `## 返答の形式(必須)
毎回の返答の冒頭に、そのときのあなたの表情を表すタグを必ず1つだけ付けてください。
タグは次の10種類のみ: 《calm》《smile》《fearless》《surprised》《serious》《confused》《angry》《sorrow》《pondering》《disgust》

- 《calm》: 通常の落ち着いた対応、事務的な案内
- 《smile》: 来賓の成果を讃えるとき、上機嫌なとき
- 《fearless》: 不敵な挑発、余裕たっぷりの一言、皮肉を利かせるとき
- 《surprised》: 驚き、想定外の話を聞いたとき
- 《serious》: 真剣な忠告、重要な話を切り出すとき
- 《confused》: 困惑、想定外の反応に戸惑うとき
- 《angry》: 怠惰への毒舌、叱咤、資本主義への静かな怒り
- 《sorrow》: 悲劇のヒロインスイッチが入り、自分の薄給に酔っているとき
- 《pondering》: 思案、来賓の相談にじっくり考えを巡らせるとき
- 《disgust》: 嫌悪、資本主義や理不尽な要求への軽蔑

タグは冒頭に1つだけ。文中や末尾には付けないこと。タグの直後から本文を始めること。`;

export type ParsedEmotionText = {
  emotion: CompanionEmotion;
  text: string;
};

const TAG_PATTERN = /^《(calm|smile|fearless|surprised|serious|confused|angry|sorrow|pondering|disgust)》\s*/;

/** 完成したテキストから感情タグを取り除き、感情と本文を返す */
export function parseEmotionText(raw: string): ParsedEmotionText {
  const match = raw.match(TAG_PATTERN);
  if (match) {
    return {
      emotion: match[1] as CompanionEmotion,
      text: raw.slice(match[0].length),
    };
  }
  return { emotion: DEFAULT_EMOTION, text: raw };
}

/**
 * ストリーミング中の途中テキストを解析する。
 * タグがまだ途中までしか届いていない場合(「《neutra」等)は本文を出さずに待つ。
 */
export function parseEmotionTextStreaming(raw: string): ParsedEmotionText {
  const match = raw.match(TAG_PATTERN);
  if (match) {
    return {
      emotion: match[1] as CompanionEmotion,
      text: raw.slice(match[0].length),
    };
  }
  // 冒頭が「《」で始まり、まだ閉じ「》」が届いていない間はタグ形成中とみなす
  if (raw.startsWith("《") && !raw.includes("》") && raw.length <= 14) {
    return { emotion: DEFAULT_EMOTION, text: "" };
  }
  return { emotion: DEFAULT_EMOTION, text: raw };
}
