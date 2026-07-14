import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getSiteTexts } from "@/lib/siteText";
import { EditableText } from "@/components/admin/EditableText";

export const metadata = {
  title: "プライバシーポリシー | リバーサル",
};

export default async function PrivacyPolicyPage() {
  const texts = await getSiteTexts();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="game-card space-y-6 text-sm leading-relaxed text-stone-300">
        <div className="text-center">
          <p className="flex justify-center">
            <Icon name="scroll" size={32} />
          </p>
          <h1 className="mansion-title mt-2 text-2xl">プライバシーポリシー</h1>
          <p className="mt-1 text-xs text-stone-500">最終改定日: 2026年7月14日</p>
        </div>

        <div className="whitespace-pre-wrap">
          <EditableText siteTextKey="privacy.content" value={texts["privacy.content"]} multiline />
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
