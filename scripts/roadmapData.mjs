// 柱記事①「AI副業の始め方ロードマップ」の図解データ
// ここを書き換えて `node scripts/generate-roadmap-svg.mjs` を実行すると、
// public/images/articles/ai-side-hustle-roadmap.svg が作り直される。
// (SVGを直接編集する必要はない)

export const ROADMAP_TITLE = "位階ロードマップ";
export const ROADMAP_SUBTITLE = "Lv.1 扉を開いた者 → Lv.3 見習いの仮面 → Lv.5 夜会の常連";
export const ROADMAP_FOOTER = "「稼げます」ではなく「続けられます」を目的にした5段階";

export const STAGES = [
  {
    level: 1,
    title: "扉を開いた者 ― 土台を作る期間",
    doLabel: "やること",
    doItems: [
      "AIツールを1つだけ選んで、1週間触ってみる",
      "発信する場所を1つ決める(X / 掲示板など)",
      "今日AIで何をしたかを1行でいいので記録する",
    ],
    noteLabel: "やらなくていい",
    noteItems: ["収益化の方法を細かく調べる", "高額講座や情報商材を探す", "フォロワー数を気にする"],
  },
  {
    level: 2,
    title: "扉を開いた者 ― 記録を習慣にする期間",
    doLabel: "やること",
    doItems: [
      "1行記録を毎日途切れさせずに続ける",
      "書き溜めた記録をたまに読み返す",
    ],
    noteLabel: "やらなくていい",
    noteItems: ["反応がないからと記録をやめる"],
  },
  {
    level: 3,
    title: "見習いの仮面 ― 発信を型にする期間",
    doLabel: "やること",
    doItems: [
      "発信のローテーションを曜日ごとに決める",
      "他の来賓の実践記録を掲示板で見る",
      "小さな成果も言語化して積み上げる",
    ],
    noteLabel: "つまずきやすい",
    noteItems: ["反応がない時期に発信をやめてしまう", "反応は「続けた人」に後から追いつく"],
  },
  {
    level: 4,
    title: "見習いの仮面 ― 型を守り抜く期間",
    doLabel: "やること",
    doItems: [
      "決めたローテーションを反応が薄くても崩さない",
      "型を守りながら小さく改善する",
    ],
    noteLabel: "つまずきやすい",
    noteItems: ["反応の良し悪しで型をころころ変える"],
  },
  {
    level: 5,
    title: "夜会の常連 ― 収益化の種をまく期間",
    doLabel: "やること",
    doItems: [
      "自分の実践記録そのものを資産にする",
      "高単価な案件を1つ選んで深く扱う",
      "誠実さを手放さない(誇張しない)",
    ],
    noteLabel: "注意",
    noteItems: ["土台がないまま焦って収益化しない"],
  },
];
