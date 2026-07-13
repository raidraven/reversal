import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const SKILL_KEYS = ["writing", "toolUsage", "consistency", "publishing", "monetization"] as const;

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const missions = await prisma.mission.findMany({
    where: { type: "daily" },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ missions });
}

const createSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(50),
  description: z.string().min(1, "説明を入力してください").max(200),
  expReward: z.number().int().min(1).max(1000),
  skillKey: z.enum(SKILL_KEYS),
});

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
      { status: 400 }
    );
  }

  const mission = await prisma.mission.create({
    data: { ...parsed.data, type: "daily" },
  });
  return NextResponse.json({ mission }, { status: 201 });
}
