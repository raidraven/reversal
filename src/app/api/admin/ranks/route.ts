import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const ranks = await prisma.rank.findMany({ orderBy: { minLevel: "asc" } });
  return NextResponse.json({ ranks });
}

const createSchema = z.object({
  minLevel: z.number().int().min(1).max(999),
  title: z.string().min(1, "称号を入力してください").max(30, "30文字以内で入力してください"),
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

  try {
    const rank = await prisma.rank.create({ data: parsed.data });
    return NextResponse.json({ rank }, { status: 201 });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { error: "そのレベルには既に称号が設定されています" },
        { status: 409 }
      );
    }
    throw e;
  }
}
