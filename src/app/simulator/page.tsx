import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { RevenueSimulator } from "@/components/simulator/RevenueSimulator";
import { SIMULATOR_TRACKS, getLatestRealRevenue } from "@/lib/revenueSimulator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI副業 収益シミュレーター | リバーサル",
  description:
    "AIライティング・AIツール活用代行など5つのAI副業タイプについて、単価と件数から現実的な月収・年収の目安を計算できます。",
};

export default async function SimulatorPage() {
  const realData = await getLatestRealRevenue();

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <header className="mb-6 text-center">
        <p className="flex justify-center">
          <Icon name="coin" size={32} />
        </p>
        <h1 className="mansion-title mt-2 text-2xl">収益シミュレーター</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          「思ったより稼げない」で心が折れる前に、現実的な数字を先に見ておきましょう。
          <br />
          単価と件数を動かして、月収の目安を計算できます。
        </p>
      </header>

      <RevenueSimulator initialTrackId={SIMULATOR_TRACKS[0].id} realData={realData} />

      <section className="mt-8">
        <p className="text-center text-xs text-stone-500">副業タイプ別ページ</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {SIMULATOR_TRACKS.map((t) => (
            <Link
              key={t.id}
              href={`/simulator/${t.id}`}
              className="rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-center text-xs text-stone-300 hover:border-gold/40"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-stone-500">
        <Link href="/" className="text-gold-light hover:underline">
          館の入口へ戻る
        </Link>
      </p>
    </main>
  );
}
