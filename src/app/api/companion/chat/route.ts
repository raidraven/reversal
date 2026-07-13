import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  buildSystemPrompt,
  countTodayUserMessages,
  getAnthropicClient,
  getRecentMessages,
  saveMessage,
  toSystemBlocks,
} from "@/lib/companion";
import { COMPANION_CONFIG } from "@/config/companion";

export const dynamic = "force-dynamic";

// GET: チャットパネル用の会話履歴
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const [messages, usedToday] = await Promise.all([
    getRecentMessages(session.user.id),
    countTodayUserMessages(session.user.id),
  ]);

  return NextResponse.json({
    messages: messages.map((m) => ({ id: m.id, role: m.role, content: m.content })),
    remaining: Math.max(COMPANION_CONFIG.dailyMessageLimit - usedToday, 0),
  });
}

const bodySchema = z.object({
  message: z.string().min(1, "メッセージを入力してください").max(2000),
});

// POST: メッセージ送信(ストリーミングレスポンス)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  }

  // レート制限: 1ユーザー1日30メッセージ
  const usedToday = await countTodayUserMessages(userId);
  if (usedToday >= COMPANION_CONFIG.dailyMessageLimit) {
    return NextResponse.json(
      { error: `本日の上限(${COMPANION_CONFIG.dailyMessageLimit}件)に達しました。また明日話そう!` },
      { status: 429 }
    );
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json(
      { error: "AIコンパニオンは現在利用できません(APIキー未設定)" },
      { status: 503 }
    );
  }

  const userMessage = parsed.data.message;

  try {
    const [systemParts, history] = await Promise.all([
      buildSystemPrompt(userId),
      getRecentMessages(userId),
    ]);

    // Claude APIの制約: messages は user ロールから始まる必要があるため、
    // 先頭にあるアシスタントの挨拶などは除いてから渡す
    const trimmedHistory = [...history];
    while (trimmedHistory.length > 0 && trimmedHistory[0].role !== "user") {
      trimmedHistory.shift();
    }

    await saveMessage(userId, "user", userMessage);

    const stream = client.messages.stream({
      model: COMPANION_CONFIG.model,
      max_tokens: COMPANION_CONFIG.maxTokens,
      system: toSystemBlocks(systemParts),
      messages: [
        ...trimmedHistory.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: userMessage },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let full = "";
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              full += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          // 完了後に応答を保存
          if (full) {
            await saveMessage(userId, "assistant", full);
          }
          controller.close();
        } catch (e) {
          console.error("companion stream error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("companion chat error:", e);
    return NextResponse.json(
      { error: "応答の生成に失敗しました。時間をおいて再度お試しください" },
      { status: 500 }
    );
  }
}
