import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getSiteTexts } from "@/lib/siteText";
import { SITE_TEXT_KEYS } from "@/lib/siteTextDefaults";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const texts = await getSiteTexts();
  return NextResponse.json({ texts });
}

const bodySchema = z.object({
  updates: z.record(z.string(), z.string().max(2000)),
});

export async function PUT(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容を確認してください" }, { status: 400 });
  }

  // 既知のキー以外は無視する(想定外のキー追加を防ぐ)
  const knownKeys = new Set(SITE_TEXT_KEYS);
  const entries = Object.entries(parsed.data.updates).filter(([key]) => knownKeys.has(key));

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteText.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );

  const texts = await getSiteTexts();
  return NextResponse.json({ ok: true, texts });
}
