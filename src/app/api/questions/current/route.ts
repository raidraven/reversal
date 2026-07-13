import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentQuestion } from "@/lib/qna";
import { readAnonId } from "@/lib/anonId";

export const dynamic = "force-dynamic";

// 今宵の問い(未ログインの来賓にも公開。いいね済み判定はanonId/userIdどちらかで行う)
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const question = await getCurrentQuestion(
    userId ? { userId } : { anonId: readAnonId() }
  );
  return NextResponse.json({ question });
}
