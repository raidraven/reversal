// 「AI副業タイプ診断」の候補一覧とスコアリングロジック(未登録公開ページ /diagnosis から使用)
// オンボーディング診断(DIAGNOSTIC_QUESTIONS)と同じ3軸(writing/toolUsage/publishing)の回答を
// 各副業タイプの重みベクトルと突き合わせて、最もスコアが高い上位3件を提示する

import type { DiagnosticAnswers } from "@/lib/onboarding";

export type SideHustleTrack = {
  id: string;
  name: string;
  description: string;
  firstTask: string;
  // 各軸への適性の重み(1〜3)。回答値との内積でスコアを出す
  weights: DiagnosticAnswers;
};

export const SIDE_HUSTLE_TRACKS: SideHustleTrack[] = [
  {
    id: "ai-writer",
    name: "AIライティング(記事・コラム作成)",
    description: "AIを使って記事やコラムを書き、クラウドソーシングやブログで発信する。文章を書くのが苦でない人向け",
    firstTask: "AIに「◯◯について300字のコラムを書いて」と頼み、自分の言葉で1箇所だけ書き直してみる",
    weights: { writing: 3, toolUsage: 2, publishing: 1 },
  },
  {
    id: "ai-ops",
    name: "AIツール活用代行(業務効率化サポート)",
    description: "AIツールを使った作業の自動化・効率化を、個人事業主や小規模事業者向けに代行する",
    firstTask: "自分の日常作業を1つ選び、AIでどこまで自動化できるか試してみる",
    weights: { writing: 1, toolUsage: 3, publishing: 1 },
  },
  {
    id: "sns-ops",
    name: "SNS運用・情報発信",
    description: "X(旧Twitter)やブログで、学びや実践を発信して読者を増やしていく",
    firstTask: "今日AIで何をしたかを、Xか掲示板に1行だけ投稿してみる",
    weights: { writing: 2, toolUsage: 1, publishing: 3 },
  },
  {
    id: "prompt-builder",
    name: "プロンプト設計・AIワークフロー構築",
    description: "定型作業をAIで再現できるよう、プロンプトや自動化フローを設計する",
    firstTask: "普段よく行う作業を1つ選び、それを再現するプロンプトを1つ作ってみる",
    weights: { writing: 2, toolUsage: 3, publishing: 1 },
  },
  {
    id: "coaching",
    name: "オンライン相談・コーチング",
    description: "自分の経験や知識を、相談・コーチングという形で人に届ける",
    firstTask: "自分が人より詳しいと思うことを1つ、3行で書き出してみる",
    weights: { writing: 2, toolUsage: 1, publishing: 3 },
  },
];

export type RankedTrack = SideHustleTrack & { score: number };

/** 診断結果(1〜3の回答)から、スコアの高い順に副業タイプを並べる */
export function rankSideHustleTracks(answers: DiagnosticAnswers): RankedTrack[] {
  return SIDE_HUSTLE_TRACKS.map((track) => ({
    ...track,
    score:
      track.weights.writing * answers.writing +
      track.weights.toolUsage * answers.toolUsage +
      track.weights.publishing * answers.publishing,
  })).sort((a, b) => b.score - a.score);
}
