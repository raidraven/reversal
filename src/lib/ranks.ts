// 位階(レベル)の称号をDBから取得する(サーバー専用・prismaを使用)
import { prisma } from "@/lib/prisma";
import { DEFAULT_RANKS, type RankRow } from "@/lib/rankTitle";

export async function getRanks(): Promise<RankRow[]> {
  const rows = await prisma.rank.findMany({ orderBy: { minLevel: "asc" } });
  if (rows.length === 0) return DEFAULT_RANKS;
  return rows.map((r) => ({ minLevel: r.minLevel, title: r.title }));
}
