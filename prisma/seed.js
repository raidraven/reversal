// 初期データのシード(`npx prisma db seed` で投入・冪等)
// 既存の行は上書きしない(管理ページからの編集を再シードで消さないため)
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// デイリーミッションの初期プール(7種から日替わりで3つが選出される。src/lib/dailyMissions.ts)
const MISSIONS = [
  {
    id: "daily-post",
    title: "投稿を1つする",
    description: "SNSやブログに、今日の進捗をひとつ投稿してみよう",
    expReward: 35,
    type: "daily",
    skillKey: "publishing",
  },
  {
    id: "daily-ai-consult",
    title: "AIに相談する",
    description: "クロエでも他のAIでも構わない。悩みや疑問をひとつ相談してみよう",
    expReward: 25,
    type: "daily",
    skillKey: "toolUsage",
  },
  {
    id: "daily-work-10min",
    title: "作業を10分する",
    description: "小さくてOK。副業に関する作業を10分だけ進めよう",
    expReward: 30,
    type: "daily",
    skillKey: "consistency",
  },
  {
    id: "daily-revenue",
    title: "収益を出す",
    description: "金額の大小は問わない。今日、何かしらの収益を発生させよう",
    expReward: 60,
    type: "daily",
    skillKey: "monetization",
  },
  {
    id: "daily-like",
    title: "他のユーザーにいいねを送る",
    description: "同じ館に集う仲間の投稿に、いいねを送ってみよう",
    expReward: 20,
    type: "daily",
    skillKey: "publishing",
  },
  {
    id: "daily-reflection",
    title: "今日の反省を書く",
    description: "今日の行動を振り返り、反省点をひとこと書き残そう",
    expReward: 30,
    type: "daily",
    skillKey: "writing",
  },
  {
    id: "daily-article",
    title: "記事を1つ書く",
    description: "ブログや note などに、記事をひとつ書き上げよう",
    expReward: 45,
    type: "daily",
    skillKey: "writing",
  },
];

// 位階(レベル)の初期称号
// Lv.20までは館の来賓としての成長、Lv.25以降は貴族位階→神話の領域へ
const RANKS = [
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

async function main() {
  for (const m of MISSIONS) {
    await prisma.mission.upsert({
      where: { id: m.id },
      create: m,
      update: {}, // 既存分は管理ページでの編集を尊重し上書きしない
    });
  }
  console.log(`Seeded ${MISSIONS.length} missions (existing rows left untouched).`);

  for (const r of RANKS) {
    await prisma.rank.upsert({
      where: { minLevel: r.minLevel },
      create: r,
      update: {},
    });
  }
  console.log(`Seeded ${RANKS.length} ranks (existing rows left untouched).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
