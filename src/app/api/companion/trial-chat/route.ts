import { NextResponse } from "next/server";
import { z } from "zod";
import { readAnonId } from "@/lib/anonId";
import {
  buildTrialSystemPrompt,
  countTrialMessages,
  incrementTrialMessages,
  getAnthropicClient,
} from "@/lib/companion";
import { COMPANION_CONFIG } from "@/config/companion";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  message: z.string().min(1, "メッセージを入力してください").max(2000),
  // 未登録者向けのため会話はサーバーに保存しない。多少の文脈を保つため直近のやり取りだけ都度受け取る
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(20)
    .optional(),
});

// 体験ページ(/experience)向けの「お試しチャット」。匿名Cookie単位で生涯10回までに制限し、会話内容は保存しない
export async function POST(req: Request) {
  const anonId = readAnonId();
  if (!anonId) {
    return NextResponse.json({ error: "セッションを確認できませんでした。ページを再読み込みしてください" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  }

  const used = await countTrialMessages(anonId);
  if (used >= COMPANION_CONFIG.trialMessageLimit) {
    return NextResponse.json(
      { error: `体験版でお話しできる回数(${COMPANION_CONFIG.trialMessageLimit}回)を使い切りました。続きは入館後にどうぞ` },
      { status: 429 }
    );
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ error: "AIコンパニオンは現在利用できません" }, { status: 503 });
  }

  await incrementTrialMessages(anonId);

  try {
    const systemPrompt = await buildTrialSystemPrompt();
    const history = parsed.data.history ?? [];

    const stream = client.messages.stream({
      model: COMPANION_CONFIG.model,
      max_tokens: COMPANION_CONFIG.maxTokens,
      system: systemPrompt,
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: parsed.data.message },
      ],
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
          console.error("trial chat stream error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("trial chat error:", e);
    return NextResponse.json({ error: "応答の生成に失敗しました。時間をおいて再度お試しください" }, { status: 500 });
  }
}
