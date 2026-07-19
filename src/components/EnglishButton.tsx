"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (options: object, elementId: string) => unknown } };
  }
}

const COOKIE_NAME = "googtrans";
const COOKIE_VALUE = "/ja/en";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string | null) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
  if (value !== null) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
  }
}

// Googleウィジェットが裏で生成する<select class="goog-te-combo">を直接操作して
// 翻訳を発火させる(cookieを置くだけでは自動適用されないブラウザがあるため)
function applyTranslation(targetLang: "en" | "") {
  const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!combo) return false;
  combo.value = targetLang;
  combo.dispatchEvent(new Event("change"));
  return true;
}

function waitForComboAndApply(targetLang: "en" | "", attempts = 20) {
  if (applyTranslation(targetLang)) return;
  if (attempts <= 0) return;
  setTimeout(() => waitForComboAndApply(targetLang, attempts - 1), 250);
}

/**
 * 海外の来訪者向け。Googleウェブサイト翻訳ウィジェットを同一オリジンで読み込み、
 * ページ全体を英語表示に切り替える(独立した翻訳プロキシページへ飛ばす方式は
 * Googleが多くのサイトで無効化しているため使わない)。
 */
export function EnglishButton() {
  const [translated, setTranslated] = useState(false);

  useEffect(() => {
    const alreadyTranslated = getCookie(COOKIE_NAME) === COOKIE_VALUE;
    setTranslated(alreadyTranslated);

    if (document.getElementById("google-translate-script")) {
      if (alreadyTranslated) waitForComboAndApply("en");
      return;
    }

    const container = document.createElement("div");
    container.id = "google_translate_element";
    container.style.display = "none";
    document.body.appendChild(container);

    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "ja", includedLanguages: "en", autoDisplay: false },
          "google_translate_element"
        );
      }
      if (alreadyTranslated) waitForComboAndApply("en");
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
  }, []);

  function toggle() {
    const next = !translated;
    setCookie(COOKIE_NAME, next ? COOKIE_VALUE : null);
    setTranslated(next);
    waitForComboAndApply(next ? "en" : "");
  }

  return (
    <button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-40 rounded-full border border-gold/50 bg-surface-card px-3 py-2 text-xs text-stone-300 shadow-gold transition-colors hover:border-gold hover:text-gold-light"
    >
      {translated ? "Japanese" : "English"}
    </button>
  );
}
