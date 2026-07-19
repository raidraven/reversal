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
    <main className="mx-auto max-w-md px-4 py-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="mansion-title flex items-center gap-2 text-xl">
          <Icon name="talk" size={22} />
          <EditableText siteTextKey="board.name" value={texts["board.name"]} />
        </h1>
        <Link href={isLoggedIn ? "/home" : "/"} className="ghost-button !px-3 !py-2 text-xs">
          {isLoggedIn ? texts["room.backLabel"] : "館の入口へ戻る"}
        </Link>
      </header>
      <p className="mb-4 text-xs text-stone-500">
        <EditableText siteTextKey="board.description" value={texts["board.description"]} />
      </p>
      <p className="mb-4 text-xs text-stone-500">
        <EditableText siteTextKey="board.postNote" value={texts["board.postNote"]} />
      </p>

      <BoardFeed isLoggedIn={isLoggedIn} emptyMessage={texts["board.emptyMessage"]} />
    </main>
  );
}
