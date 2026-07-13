import Link from "next/link";
import { getSiteTexts } from "@/lib/siteText";

export default async function NotFound() {
  const texts = await getSiteTexts();

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="game-card w-full max-w-sm space-y-4 text-center animate-fade-up">
        <p className="text-4xl">🚪</p>
        <h1 className="mansion-title text-xl">その扉の先には何もございません</h1>
        <p className="text-sm text-stone-400">
          道に迷われたようです。ご自身の部屋へお戻りください。
        </p>
        <Link href="/home" className="neon-button block w-full">
          {texts["room.backLabel"]}
        </Link>
      </div>
    </main>
  );
}
