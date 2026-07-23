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
          この館に入館すると「自室」というあなただけの部屋が与えられます。
          <br />
          日々の小さな行動が「今宵の使命」として経験値に変わり、位階が上がっていく――その一場面を、未登録のままお試しください。
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
