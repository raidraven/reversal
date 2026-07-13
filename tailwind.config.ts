import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // 見出し用の上品なセリフ体(システムフォントのみ・外部取得なし)
        serif: [
          "Georgia",
          "'Hiragino Mincho ProN'",
          "'Yu Mincho'",
          "'Noto Serif JP'",
          "serif",
        ],
      },
      colors: {
        // 洋館・仮面舞踏会テーマ: 漆黒 × 深紅 × アンティークゴールド
        surface: {
          DEFAULT: "#0a0708",
          card: "#160f11",
          raised: "#1f1418",
          border: "#3a2530",
        },
        gold: {
          DEFAULT: "#c9a24d",
          light: "#e6c878",
          dark: "#8a6f2f",
        },
        wine: {
          DEFAULT: "#5c1a2b",
          light: "#7d2438",
          dark: "#3a0f1c",
        },
        candle: "#e8c88a",
      },
      boxShadow: {
        gold: "0 0 14px rgba(201, 162, 77, 0.35)",
        wine: "0 0 14px rgba(124, 36, 56, 0.4)",
      },
      keyframes: {
        "bar-grow": {
          from: { width: "0%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "bar-grow": "bar-grow 0.8s ease-out",
        "fade-up": "fade-up 0.4s ease-out both",
        flicker: "flicker 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
