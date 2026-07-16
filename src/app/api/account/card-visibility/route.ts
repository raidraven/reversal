import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ cardPublic: z.boolean() });

// 会員証(/card/[id])を第三者に公開するかどうかの切り替え
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容を確認してください" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { cardPublic: parsed.data.cardPublic },
  });

  return NextResponse.json({ ok: true });
}
