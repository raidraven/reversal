// 運営都合(サイト障害・大規模改修等)で来館できなかった日を扱うロジック。
// 管理ページで日付を登録すると、ストリーク判定でその日を欠席扱いにしない。
// 来賓個人の「ログイン忘れ」は対象外(手動登録された日だけを救済する)
import { prisma } from "@/lib/prisma";
import { previousDay } from "@/lib/date";

// 障害日が連続で登録されていても際限なく遡らないための安全装置
const MAX_LOOKBACK_DAYS = 30;

/**
 * "today" から1日ずつ遡り、障害日として登録されている日はスキップして、
 * ストリーク判定上の「実質的な前日」を求める。
 * 障害日が無ければ通常通り previousDay(today) と同じ結果になる。
 */
export async function effectivePreviousLoginDay(today: string): Promise<string> {
  let d = previousDay(today);
  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const incident = await prisma.incidentDay.findUnique({ where: { date: d } });
    if (!incident) return d;
    d = previousDay(d);
  }
  return d;
}
