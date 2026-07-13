import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteTextsManager } from "@/components/admin/SiteTextsManager";
import { RanksManager } from "@/components/admin/RanksManager";
import { MissionsManager } from "@/components/admin/MissionsManager";
import { IncidentDaysManager } from "@/components/admin/IncidentDaysManager";
import { PostsManager } from "@/components/admin/PostsManager";
import { listAllIconCandidates } from "@/lib/iconCandidates";
import { ICON_SLOTS } from "@/lib/siteTextDefaults";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (!session.user.isAdmin) redirect("/home");

  const requests = await prisma.hostRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  const iconCandidates = listAllIconCandidates(ICON_SLOTS);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/70">館の主 専用</p>
          <h1 className="mansion-title text-2xl">管理ページ</h1>
        </div>
        <Link href="/home" className="ghost-button !px-3 !py-2 text-xs">
          ホームへ戻る
        </Link>
      </header>

      <SiteTextsManager iconCandidates={iconCandidates} />
      <RanksManager />
      <MissionsManager />
      <PostsManager />
      <IncidentDaysManager />

      <section>
        <h2 className="mansion-title text-lg">主催者への要望</h2>
        <p className="mb-4 mt-1 text-sm text-stone-400">
          来賓たちから届いた要望・感想の一覧です(全 {requests.length} 件)。
        </p>

        {requests.length === 0 ? (
          <div className="game-card text-center text-sm text-stone-500">
            まだ要望は届いていません。
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="game-card">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-serif text-gold-light">{r.name}</span>
                  <span>{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-200">
                  {r.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
