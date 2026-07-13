// アカウント追放(banned)状態のチェック
// ミドルウェアはEdge runtimeで動くためDBを引けない(SQLite Prisma非対応)。
// そのため実際の強制は、投稿・回答など「コンテンツを作る」操作の入口でDBを都度確認する形で行う
import { prisma } from "@/lib/prisma";

export async function isBanned(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { banned: true } });
  return !!user?.banned;
}
