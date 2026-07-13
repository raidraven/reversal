"use client";

import { useEffect, useState } from "react";

/**
 * 数値を0から目標値までカウントアップさせるフック。
 * バックグラウンドタブでは requestAnimationFrame が停止するため、
 * durationMs 経過後に必ず目標値へスナップするフォールバックを持つ。
 */
export function useCountUp(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0 || (typeof document !== "undefined" && document.hidden)) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // rAFが動かない環境でも最終値を保証する
    const fallback = setTimeout(() => setValue(target), durationMs + 100);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [target, durationMs]);

  return value;
}
