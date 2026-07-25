import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { DiagnosisQuiz } from "@/components/diagnosis/DiagnosisQuiz";

export const metadata: Metadata = {
  title: "AI副業タイプ診断 | リバーサル",
  description:
    "3つの質問に答えるだけで、AIを使った副業のうちあなたに合うタイプを診断します。今日から始められる最初の1タスクも提示します。",
};

export default function DiagnosisPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <header className="mb-6 text-center">
        <p className="flex justify-center">
          <Icon name="question" size={32} />
        </p>
        <h1 className="mansion-title mt-2 text-2xl">AI副業タイプ診断</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          「何から始めればいいか分からない」人向けの3問診断です。
          <br />
          あなたに合うAI副業のタイプを3つに絞り、今日やれる最初の1タスクまで提示します。
        </p>
      </header>

      <DiagnosisQuiz />

      <p className="mt-8 text-center text-xs text-stone-500">
        <Link href="/" className="text-gold-light hover:underline">
          館の入口へ戻る
        </Link>
      </p>
    </main>
  );
}
