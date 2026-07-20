import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="game-card w-full max-w-sm space-y-4 text-center animate-fade-up">
        <p className="flex justify-center">
          <Icon name="door" size={40} />
        </p>
        <h1 className="mansion-title text-xl">その扉の先には何もございません</h1>
        <p className="text-sm text-stone-400">
          道に迷われたようです。館の入口へお戻りください。
        </p>
        <Link href="/" className="neon-button block w-full">
          館の入口へ戻る
        </Link>
      </div>
    </main>
  );
}
