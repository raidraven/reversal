// 談話室の投稿カテゴリ定義(サーバー/クライアント共有・Prisma等のI/Oは一切importしないこと)
import type { IconName } from "@/components/Icon";

export const POST_CATEGORIES = ["achievement", "tip", "tool"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  achievement: "実績報告",
  tip: "学び・気づき",
  tool: "ツール活用のコツ",
};

export const POST_CATEGORY_ICONS: Record<PostCategory, IconName> = {
  achievement: "trophy",
  tip: "bulb",
  tool: "tools",
};

export function isPostCategory(value: string): value is PostCategory {
  return (POST_CATEGORIES as readonly string[]).includes(value);
}
