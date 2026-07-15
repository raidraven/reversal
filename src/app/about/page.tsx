import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getSiteTexts } from "@/lib/siteText";
import { EditableText } from "@/components/admin/EditableText";

export const metadata = {
  title: "運営者情報 | リバーサル",
  description: "リバーサルの運営者情報・お問い合わせ先です。",
};

export default async function AboutPage() {
  const texts = await getSiteTexts();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="game-card space-y-6 text-sm leading-relaxed text-stone-300">
        <div className="text-center">
          <p className="flex justify-center">
            <Icon name="candle" size={32} />
          </p>
          <h1 className="mansion-title mt-2 text-2xl">運営者情報</h1>
        </div>

        <div className="whitespace-pre-wrap">
          <EditableText siteTextKey="about.content" value={texts["about.content"]} multiline />
        </div>

        <div className="border-t border-surface-border pt-4 text-center text-xs text-stone-500">
          <Link href="/" className="text-gold-light hover:underline">
            館の入口へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
