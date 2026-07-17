import { NextResponse } from "next/server";
import { z } from "zod";
import { readAnonId } from "@/lib/anonId";
import {
  buildTrialSystemPrompt,
  countTrialMessages,
  getAnthropicClient,
  incrementTrialMessages,
} from "@/lib/companion";
import { COMPANION_CONFIG } from "@/config/companion";

export const dynamic = "force-dynamic";

// GET: 残り利用可能回数の確認(会話内容は保存していないため履歴は返さない)
export async function GET() {
  const anonId = readAnonId();
  const used = anonId ? await countTrialMessages(anonId) : 0;
  return NextResponse.json({
    remaining: Math.max(COMPANION_CONFIG.trialMessageLimit - used, 0),
  });
}

const bodySchema = z.object({
  message: z.string().min(1, "メッセージを入力してください").max(2000),
  // クライアント側で保持している直近の会話(このエンドポイントは会話を保存しないため、毎回渡してもらう)
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(20)
    .optional(),
});

// POST: LPの未登録来訪者向け「お試しチャット」(生涯10件まで、会話は保存しない)
export async function POST(req: Request) {
  const anonId = readAnonId();
  if (!anonId) {
    return NextResponse.json(
      { error: "セッションを確認できませんでした。ページを再読み込みしてお試しください" },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  }

  const used = await countTrialMessages(anonId);
  if (used >= COMPANION_CONFIG.trialMessageLimit) {
    return NextResponse.json(
      { error: "お試しチャットの上限に達しました。続きは会員登録の上お楽しみください" },
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

  try {
    const system = await buildTrialSystemPrompt();
    const history = (parsed.data.history ?? []).slice(-COMPANION_CONFIG.contextExchanges * 2);

    await incrementTrialMessages(anonId);

    const stream = client.messages.stream({
      model: COMPANION_CONFIG.model,
      max_tokens: COMPANION_CONFIG.maxTokens,
      system,
      messages: [...history, { role: "user" as const, content: parsed.data.message }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (e) {
          console.error("trial companion stream error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Trial-Remaining": String(Math.max(COMPANION_CONFIG.trialMessageLimit - used - 1, 0)),
      },
    });
  } catch (e) {
    console.error("trial companion chat error:", e);
    return NextResponse.json(
      { error: "応答の生成に失敗しました。時間をおいて再度お試しください" },
      { status: 500 }
    );
  }
}
