import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { RevenueSimulator } from "@/components/simulator/RevenueSimulator";
import { getSimulatorTrack, getLatestRealRevenue } from "@/lib/revenueSimulator";

export const dynamic = "force-dynamic";

type Props = { params: { trackId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const track = getSimulatorTrack(params.trackId);
  if (!track) return { title: "収益シミュレーター | リバーサル" };
  const example = track.unitDefault * track.quantityDefault;
  return {
    title: `${track.name}の収益シミュレーター | リバーサル`,
    description: `${track.name}の${track.unitLabel}と${track.quantityLabel}から、月収の目安を計算します。例: ${track.unitDefault.toLocaleString()}円×${track.quantityDefault}=月${example.toLocaleString()}円。`,
  };
}

export default async function SimulatorTrackPage({ params }: Props) {
  const track = getSimulatorTrack(params.trackId);
  if (!track) notFound();

  const realData = await getLatestRealRevenue();

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <header className="mb-6 text-center">
        <p className="flex justify-center">
          <Icon name="coin" size={32} />
        </p>
        <h1 className="mansion-title mt-2 text-2xl">{track.name}の収益シミュレーター</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          {track.unitLabel}と{track.quantityLabel}を動かして、月収の目安を計算できます。
        </p>
      </header>

      <RevenueSimulator initialTrackId={track.id} lockTrack realData={realData} />

      <p className="mt-8 text-center text-xs text-stone-500">
        <Link href="/simulator" className="text-gold-light hover:underline">
          他の副業タイプも見る
        </Link>
        {" ・ "}
        <Link href="/" className="text-gold-light hover:underline">
          館の入口へ戻る
        </Link>
      </p>
    </main>
  );
}
