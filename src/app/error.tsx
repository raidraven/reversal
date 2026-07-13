"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="game-card w-full max-w-sm space-y-4 text-center animate-fade-up">
        <p className="text-4xl">🕯️</p>
        <h1 className="mansion-title text-xl">館に何かが起こったようです</h1>
        <p className="text-sm text-stone-400">
          予期せぬ出来事が起きました。少し間を置いて、もう一度お試しください。
        </p>
        <button onClick={reset} className="neon-button w-full">
          もう一度試す
        </button>
      </div>
    </main>
  );
}
