import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getSiteTexts } from "@/lib/siteText";
import { BoardFeed } from "@/components/board/BoardFeed";
import { SiteIcon } from "@/components/SiteIcon";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const session = await getServerSession(authOptions);
  const texts = await getSiteTexts();

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="mansion-title flex items-center gap-2 text-xl">
          <SiteIcon value={texts["board.icon"]} size={22} />
          {texts["board.name"]}
        </h1>
        <Link href="/home" className="ghost-button !px-3 !py-2 text-xs">
          {texts["room.backLabel"]}
        </Link>
      </header>
      <p className="mb-4 text-xs text-stone-500">
        副業初心者の来賓たちが、実績・学び・ツール活用のコツを持ち寄る場所です。
      </p>

      <BoardFeed isLoggedIn={!!session?.user?.id} />
    </main>
  );
}
