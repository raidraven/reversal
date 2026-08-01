import type { CardLink } from "@/components/home/MemberCard";

export const PREVIEW_STORAGE_KEY = "reversal_profile_card_preview";

/**
 * 未登録の体験版(ProfileCardMaker)から個別プレビューページへ渡すデータ。
 * sessionStorage経由で渡すため、blob: URL(ローカル選択画像)もクライアント遷移である限り有効
 */
export type DemoPreviewPayload = {
  name: string;
  avatarIcon: string;
  title: string;
  bio: string;
  links: CardLink[];
  iconUrl: string | null;
  bgUrl: string | null;
  wallpaperUrl: string | null;
  headerText?: string;
  nameSuffixText?: string;
  titleText?: string;
  levelLabelText?: string;
  memberSinceLabelText?: string;
  scale: number;
};
