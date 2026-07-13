// 位階(レベル)→称号の変換(クライアント/サーバー両方から使える純粋関数)
// Prisma等のI/Oを一切importしないこと(クライアントコンポーネントからも使うため)

export type RankRow = { minLevel: number; title: string };

export const DEFAULT_RANKS: RankRow[] = [
  { minLevel: 1, title: "扉を開いた者" },
  { minLevel: 3, title: "見習いの仮面" },
  { minLevel: 5, title: "夜会の常連" },
  { minLevel: 8, title: "熟達の来賓" },
  { minLevel: 12, title: "黄金の仮面卿" },
  { minLevel: 16, title: "深紅の貴族" },
  { minLevel: 20, title: "館の伝説" },
  { minLevel: 25, title: "白銀の伯爵" },
  { minLevel: 30, title: "紫水晶の侯爵" },
  { minLevel: 40, title: "黒曜の公爵" },
  { minLevel: 50, title: "深奥の大公" },
  { minLevel: 60, title: "永夜の君主" },
  { minLevel: 70, title: "星辰の賢者" },
  { minLevel: 80, title: "深淵の支配者" },
  { minLevel: 90, title: "神話に刻まれし者" },
  { minLevel: 100, title: "リバーサルそのもの" },
];

/** レベルに応じた称号を返す(ranks省略時はデフォルト称号セットを使用) */
export function titleForRank(level: number, ranks: RankRow[] = DEFAULT_RANKS): string {
  const sorted = [...ranks].sort((a, b) => a.minLevel - b.minLevel);
  let current = sorted[0]?.title ?? "来賓";
  for (const r of sorted) {
    if (level >= r.minLevel) current = r.title;
  }
  return current;
}
