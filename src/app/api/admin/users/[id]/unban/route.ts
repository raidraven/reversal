import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 自動追放を管理ページから取り消す(誤爆した通報などの救済用)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { banned: false, bannedAt: null },
    });
    return NextResponse.json({ ok: true, banned: user.banned });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2025") {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
    }
    throw e;
  }
}
