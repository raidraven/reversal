import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getSiteTexts } from "@/lib/siteText";
import { BoardFeed } from "@/components/board/BoardFeed";
import { Icon } from "@/components/Icon";
import { EditableText } from "@/components/admin/EditableText";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;
  const texts = await getSiteTexts();

  return (
    <main className="mx-auto max-w-md px-4 py-8 lg:max-w-2xl">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="mansion-title flex items-center gap-2 text-xl">
          <Icon name="talk" size={22} />
          <EditableText siteTextKey="board.name" value={texts["board.name"]} />
        </h1>
        {!isLoggedIn && (
          <Link href="/" className="ghost-button !px-3 !py-2 text-xs">
            館の入口へ戻る
          </Link>
        )}
      </header>
      <p className="mb-4 text-xs text-stone-500">
        <EditableText siteTextKey="board.description" value={texts["board.description"]} />
      </p>
      <p className="mb-4 text-xs text-stone-500">
        <EditableText siteTextKey="board.postNote" value={texts["board.postNote"]} />
      </p>

      <div className="mb-4 rounded-md border border-surface-border bg-surface-raised p-3">
        <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-gold-light">
          <Icon name="scroll" size={14} /> ガイドライン
        </p>
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-stone-400">
          <EditableText siteTextKey="board.guidelines" value={texts["board.guidelines"]} multiline />
        </p>
      </div>

      <BoardFeed isLoggedIn={isLoggedIn} emptyMessage={texts["board.emptyMessage"]} />
    </main>
  );
}
