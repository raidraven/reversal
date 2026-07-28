import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { EditableText } from "@/components/admin/EditableText";
import { ExperienceDemo } from "@/components/experience/ExperienceDemo";
import { getTodaysMissions } from "@/lib/dailyMissions";
import { todayJst } from "@/lib/date";
import { readAnonId } from "@/lib/anonId";
import { countTrialMessages } from "@/lib/companion";
import { getSiteTexts } from "@/lib/siteText";
import { COMPANION_CONFIG } from "@/config/companion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "体験する | リバーサル",
  description: "登録前に、位階・使命システムでレベルアップする感覚を体験できます。",
};

export default async function ExperiencePage() {
  const today = todayJst();
  const anonId = readAnonId();

  const [missions, texts, trialUsed] = await Promise.all([
    getTodaysMissions(today),
    getSiteTexts(),
    anonId ? countTrialMessages(anonId) : Promise.resolve(0),
  ]);

  const demoMissions = missions.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    expReward: m.expReward,
    skillKey: m.skillKey,
  }));
  const trialChatRemaining = Math.max(COMPANION_CONFIG.trialMessageLimit - trialUsed, 0);

  return (
    <main className="mx-auto max-w-md px-4 pb-24 lg:max-w-5xl">
      <header className="flex items-center justify-between py-4">
        <h1 className="mansion-title flex items-center gap-2 text-lg">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Icon name="candle" size={24} />
            <EditableText siteTextKey="site.name" value={texts["site.name"]} />
          </Link>
        </h1>
      </header>

      <div className="mb-6 text-center">
        <p className="flex justify-center">
          <Icon name="key-ornate" size={32} />
        </p>
        <h2 className="mansion-title mt-2 text-2xl">体験する</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          この館に入館すると与えられる「自室」を、未登録のままお試しいただけます。
          <br />
          今宵の使命は毎日入れ替わり、位階はLv.{5}まで上げられます。
        </p>
      </div>

      <ExperienceDemo missions={demoMissions} todayStr={today} trialChatRemaining={trialChatRemaining} />

      <p className="mt-8 text-center text-xs text-stone-500">
        <Link href="/" className="text-gold-light hover:underline">
          館の入口へ戻る
        </Link>
      </p>
    </main>
  );
}
