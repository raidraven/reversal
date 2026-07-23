import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ExperienceDemo } from "@/components/experience/ExperienceDemo";

export const metadata: Metadata = {
  title: "体験する | リバーサル",
  description: "登録前に、位階・使命システムでレベルアップする感覚を体験できます。",
};

export default function ExperiencePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <header className="mb-6 text-center">
        <p className="flex justify-center">
          <Icon name="key-ornate" size={32} />
        </p>
        <h1 className="mansion-title mt-2 text-2xl">体験する</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          この館では、日々の小さな行動を「今宵の使命」として経験値に変え、位階を上げていきます。
          <br />
          実際にどんな感覚か、未登録のままお試しください。
        </p>
      </header>

      <ExperienceDemo />

      <p className="mt-8 text-center text-xs text-stone-500">
        <Link href="/" className="text-gold-light hover:underline">
          館の入口へ戻る
        </Link>
      </p>
    </main>
  );
}
