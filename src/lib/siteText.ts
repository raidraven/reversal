// サイト全体の文言・アイコンをDBから取得する(サーバー専用・prismaを使用)
import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_TEXT } from "@/lib/siteTextDefaults";

export async function getSiteTexts(): Promise<Record<string, string>> {
  const rows = await prisma.siteText.findMany();
  const map = { ...DEFAULT_SITE_TEXT };
  for (const r of rows) {
    if (r.value) map[r.key] = r.value;
  }
  return map;
}

export async function getSiteText(key: string): Promise<string> {
  const row = await prisma.siteText.findUnique({ where: { key } });
  return row?.value || DEFAULT_SITE_TEXT[key] || "";
}
