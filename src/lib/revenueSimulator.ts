// 収益シミュレーター(プログラマティックSEO用)の副業タイプ別デフォルト値
// sideHustleDiagnosis.ts の5タイプと同じidを使い、診断結果とシミュレーターを相互リンクできるようにする
import { prisma } from "@/lib/prisma";

export type SimulatorTrack = {
  id: string;
  name: string;
  unitLabel: string;
  unitSuffix: string;
  unitDefault: number;
  unitStep: number;
  unitMin: number;
  unitMax: number;
  quantityLabel: string;
  quantitySuffix: string;
  quantityDefault: number;
  quantityStep: number;
  quantityMin: number;
  quantityMax: number;
};

export const SIMULATOR_TRACKS: SimulatorTrack[] = [
  {
    id: "ai-writer",
    name: "AIライティング(記事・コラム作成)",
    unitLabel: "記事単価",
    unitSuffix: "円",
    unitDefault: 3000,
    unitStep: 500,
    unitMin: 500,
    unitMax: 50000,
    quantityLabel: "月の本数",
    quantitySuffix: "本",
    quantityDefault: 5,
    quantityStep: 1,
    quantityMin: 1,
    quantityMax: 60,
  },
  {
    id: "ai-ops",
    name: "AIツール活用代行(業務効率化サポート)",
    unitLabel: "月額契約額",
    unitSuffix: "円",
    unitDefault: 15000,
    unitStep: 5000,
    unitMin: 5000,
    unitMax: 200000,
    quantityLabel: "契約社数",
    quantitySuffix: "社",
    quantityDefault: 1,
    quantityStep: 1,
    quantityMin: 1,
    quantityMax: 20,
  },
  {
    id: "sns-ops",
    name: "SNS運用・情報発信",
    unitLabel: "案件単価",
    unitSuffix: "円",
    unitDefault: 20000,
    unitStep: 5000,
    unitMin: 5000,
    unitMax: 300000,
    quantityLabel: "月の案件数",
    quantitySuffix: "件",
    quantityDefault: 1,
    quantityStep: 1,
    quantityMin: 1,
    quantityMax: 20,
  },
  {
    id: "prompt-builder",
    name: "プロンプト設計・AIワークフロー構築",
    unitLabel: "案件単価",
    unitSuffix: "円",
    unitDefault: 30000,
    unitStep: 5000,
    unitMin: 5000,
    unitMax: 500000,
    quantityLabel: "月の案件数",
    quantitySuffix: "件",
    quantityDefault: 1,
    quantityStep: 1,
    quantityMin: 1,
    quantityMax: 20,
  },
  {
    id: "coaching",
    name: "オンライン相談・コーチング",
    unitLabel: "セッション単価",
    unitSuffix: "円",
    unitDefault: 5000,
    unitStep: 1000,
    unitMin: 1000,
    unitMax: 100000,
    quantityLabel: "月のセッション数",
    quantitySuffix: "回",
    quantityDefault: 4,
    quantityStep: 1,
    quantityMin: 1,
    quantityMax: 60,
  },
];

export function getSimulatorTrack(id: string): SimulatorTrack | undefined {
  return SIMULATOR_TRACKS.find((t) => t.id === id);
}

/** シミュレーターに添える「このサイト自身の実況ログ」の最新の実数字(誇張しないための実例) */
export async function getLatestRealRevenue(): Promise<{ amount: number; date: string; postId: string } | null> {
  const post = await prisma.post.findFirst({
    where: { revenueAmount: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { id: true, revenueAmount: true, createdAt: true },
  });
  if (!post || post.revenueAmount === null) return null;
  return {
    amount: post.revenueAmount,
    date: new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", dateStyle: "medium" }).format(post.createdAt),
    postId: post.id,
  };
}
