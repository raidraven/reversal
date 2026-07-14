// 初期診断・仮面定義(signup画面とAPIで共有)
import type { IconName } from "@/components/Icon";

export const AVATARS = [
  { id: "mask-gold", icon: "mask" as IconName, label: "黄金の仮面" },
  { id: "mask-owl", icon: "owl" as IconName, label: "梟の仮面" },
  { id: "mask-rose", icon: "rose" as IconName, label: "薔薇の仮面" },
  { id: "mask-bat", icon: "bat" as IconName, label: "蝙蝠の仮面" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export const DIAGNOSTIC_QUESTIONS = [
  {
    key: "writing",
    question: "文章を書くのは得意ですか?",
    options: [
      { value: 1, label: "苦手…" },
      { value: 2, label: "普通くらい" },
      { value: 3, label: "得意!" },
    ],
  },
  {
    key: "toolUsage",
    question: "AIツール(ChatGPT / Claudeなど)を使ったことはありますか?",
    options: [
      { value: 1, label: "ほぼ初めて" },
      { value: 2, label: "たまに使う" },
      { value: 3, label: "毎日使っている" },
    ],
  },
  {
    key: "publishing",
    question: "SNSやブログで発信した経験はありますか?",
    options: [
      { value: 1, label: "ない" },
      { value: 2, label: "少しある" },
      { value: 3, label: "継続している" },
    ],
  },
] as const;

export type DiagnosticAnswers = {
  writing: number;
  toolUsage: number;
  publishing: number;
};

/** 診断の回答(1〜3)を初期スキル値に変換する */
export function computeInitialSkills(answers: DiagnosticAnswers) {
  const toScore = (v: number) => 10 + Math.min(Math.max(v, 1), 3) * 10; // 20 / 30 / 40
  return {
    writing: toScore(answers.writing),
    toolUsage: toScore(answers.toolUsage),
    publishing: toScore(answers.publishing),
    consistency: 10,
    monetization: 10,
  };
}
