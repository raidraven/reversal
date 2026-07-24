import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put, del } from "@vercel/blob";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const FIELD_TO_COLUMN = {
  wallpaper: "cardWallpaperUrl",
  icon: "cardIconUrl",
  background: "cardBgUrl",
} as const;
type Field = keyof typeof FIELD_TO_COLUMN;

function extFromType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

// プロフカードの画像(壁紙・アイコン・会員証背景)アップロード。1リクエスト1画像
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const field = form?.get("field");

  if (!(file instanceof File) || typeof field !== "string" || !(field in FIELD_TO_COLUMN)) {
    return NextResponse.json({ error: "入力内容を確認してください" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "jpeg/png/webp/gif画像のみアップロードできます" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "画像サイズは5MBまでです" }, { status: 400 });
  }

  const column = FIELD_TO_COLUMN[field as Field];
  const pathname = `profile-card/${session.user.id}/${field}-${Date.now()}.${extFromType(file.type)}`;

  const blob = await put(pathname, file, { access: "public", addRandomSuffix: true });

  const previous = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { [column]: true } as Record<string, true>,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { [column]: blob.url },
  });

  const previousUrl = (previous as Record<string, string | null> | null)?.[column];
  if (previousUrl) {
    await del(previousUrl).catch(() => {
      // 旧画像の削除失敗はユーザー操作の成否に影響させない(ストレージに残るだけ)
    });
  }

  return NextResponse.json({ ok: true, url: blob.url });
}

// アップロード済み画像を削除してデフォルト表示に戻す
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const field = body?.field;
  if (typeof field !== "string" || !(field in FIELD_TO_COLUMN)) {
    return NextResponse.json({ error: "入力内容を確認してください" }, { status: 400 });
  }

  const column = FIELD_TO_COLUMN[field as Field];
  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { [column]: true } as Record<string, true>,
  });
  const currentUrl = (current as Record<string, string | null> | null)?.[column];

  await prisma.user.update({
    where: { id: session.user.id },
    data: { [column]: null },
  });

  if (currentUrl) {
    await del(currentUrl).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
