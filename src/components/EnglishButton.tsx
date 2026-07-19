"use client";

/**
 * 海外の来訪者向け。Google翻訳経由で現在のページを英語表示する。
 * サイト全体を多言語対応するのは大掛かりなため、まずは軽量な代替手段として設置する
 */
export function EnglishButton() {
  function openTranslated() {
    const url = `https://translate.google.com/translate?sl=ja&tl=en&u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={openTranslated}
      className="fixed bottom-5 left-5 z-40 rounded-full border border-gold/50 bg-surface-card px-3 py-2 text-xs text-stone-300 shadow-gold transition-colors hover:border-gold hover:text-gold-light"
    >
      English
    </button>
  );
}
