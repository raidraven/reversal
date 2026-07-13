import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const SKILL_KEYS = ["writing", "toolUsage", "consistency", "publishing", "monetization"] as const;

const updateSchema = z.object({
  title: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(200).optional(),
  expReward: z.number().int().min(1).max(1000).optional(),
  skillKey: z.enum(SKILL_KEYS).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容を確認してください" }, { status: 400 });
  }

  try {
    const mission = await prisma.mission.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ mission });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2025") {
      return NextResponse.json({ error: "ミッションが見つかりません" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await prisma.mission.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2025") {
      return NextResponse.json({ error: "ミッションが見つかりません" }, { status: 404 });
    }
    throw e;
  }
}
