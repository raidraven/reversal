// ミッション表示用の共有定義(ミッション本体はDBの Mission テーブル / prisma/seed.js)

export const SKILL_LABELS: Record<string, string> = {
  writing: "ライティング",
  toolUsage: "ツール活用",
  consistency: "継続力",
  publishing: "発信力",
  monetization: "収益化",
};

export const SKILL_ICONS: Record<string, string> = {
  writing: "📝",
  toolUsage: "🛠️",
  consistency: "⏱️",
  publishing: "📣",
  monetization: "💰",
};
