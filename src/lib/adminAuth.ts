// 管理API共通の権限チェック
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; message: string };

export async function requireAdmin(): Promise<AdminAuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, status: 401, message: "ログインが必要です" };
  }
  if (!session.user.isAdmin) {
    return { ok: false, status: 403, message: "館の主のみ許可された操作です" };
  }
  return { ok: true, userId: session.user.id };
}
