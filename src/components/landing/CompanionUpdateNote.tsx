import Link from "next/link";
import { COMPANION_CONFIG } from "@/config/companion";
import { DEFAULT_EMOTION } from "@/lib/companionEmotion";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";
import { EditableText } from "@/components/admin/EditableText";

type Props = {
  updateNote: string;
  latestArticle: { slug: string; title: string } | null;
};

/**
 * LPで、クロエがおすすめコンテンツとサイトの更新情報を来訪者に知らせるカード。
 * 常時稼働のチャットではなく、更新のたびに管理者が編集モードで文言を差し替える軽量な仕組みにしている
 */
export function CompanionUpdateNote({ updateNote, latestArticle }: Props) {
  return (
    <section className="game-card flex items-start gap-3 border-gold/30">
      <CompanionAvatar emotion={DEFAULT_EMOTION} fallbackEmoji={COMPANION_CONFIG.emoji} sizeClass="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-gold-light">{COMPANION_CONFIG.name}(執事)より</p>
        <p className="mt-1 text-sm leading-relaxed text-stone-200">
          <EditableText siteTextKey="landing.companionUpdateNote" value={updateNote} multiline />
        </p>
        {latestArticle && (
          <p className="mt-2 text-sm text-stone-300">
            今の一押しはこちらでございます:{" "}
            <Link href={`/articles/${latestArticle.slug}`} className="text-gold-light hover:underline">
              {latestArticle.title}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
